import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen3-0.6B-ONNX";

class TextGenerationPipeline {
  static async getInstance(progress_callback = null) {
    this.tokenizer ??= await AutoTokenizer.from_pretrained(MODEL_ID, {
      progress_callback,
    });

    this.model ??= await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback,
    });

    return [this.tokenizer, this.model];
  }
}

const stopping_criteria = new InterruptableStoppingCriteria();

function handleProgress(event) {
  if (!event.total) return;
  const file = event.url || MODEL_ID;
  if (event.loaded === 0) {
    self.postMessage({ status: "initiate", file, progress: 0, total: event.total });
  } else if (event.loaded < event.total) {
    self.postMessage({
      status: "progress",
      file,
      progress: Math.round((event.loaded / event.total) * 100),
      total: 100,
    });
  } else {
    self.postMessage({ status: "done", file });
  }
}

async function load() {
  self.postMessage({ status: "loading", data: "Checking WebGPU support..." });
  try {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) throw new Error("WebGPU is not supported on this device.");

    self.postMessage({ status: "loading", data: "Downloading model..." });
    const [tokenizer, model] = await TextGenerationPipeline.getInstance(handleProgress);

    self.postMessage({ status: "loading", data: "Warming up model..." });
    const inputs = tokenizer("a");
    await model.generate({ ...inputs, max_new_tokens: 1 });

    self.postMessage({ status: "ready" });
  } catch (error) {
    self.postMessage({
      status: "error",
      data: error?.message || error?.toString() || "Unknown error during load",
    });
  }
}

async function webSearch(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const results = [];

    if (data.AbstractText) results.push(data.AbstractText);

    if (data.RelatedTopics?.length) {
      for (const topic of data.RelatedTopics.slice(0, 3)) {
        if (topic.Text) results.push(topic.Text);
      }
    }

    return results.length > 0 ? results.join("\n\n") : null;
  } catch (error) {
    console.warn("Search failed:", error.message);
    return null;
  }
}

function extractReference(messages) {
  const systemContent = messages[0]?.content || "";
  const match = systemContent.match(/passage is ([^:]+):/);
  return match ? match[1].trim() : "";
}

function parseThinking(rawBuffer) {
  const start = rawBuffer.indexOf("<think>");
  const end = rawBuffer.indexOf("</think>");

  if (start !== -1) {
    if (end !== -1 && end > start) {
      return {
        thought: rawBuffer.slice(start + 7, end).trim(),
        answer: rawBuffer.slice(end + 8).trim(),
        state: "answering",
      };
    }
    return {
      thought: rawBuffer.slice(start + 7),
      answer: "",
      state: "thinking",
    };
  }

  return { thought: "", answer: rawBuffer, state: "answering" };
}

async function generate(messages) {
  const [tokenizer, model] = await TextGenerationPipeline.getInstance();

  const reference = extractReference(messages);
  const userQuestion = messages.at(-1)?.content || "";
  const searchQuery = `${reference} ${userQuestion} Bible commentary`;

  self.postMessage({ status: "searching", data: searchQuery });

  const searchResults = await webSearch(searchQuery);

  const augmentedMessages = searchResults
    ? [
        {
          ...messages[0],
          content: messages[0].content + `\n\nRelevant context from web search:\n${searchResults}`,
        },
        ...messages.slice(1),
      ]
    : messages;

  const inputs = tokenizer.apply_chat_template(augmentedMessages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  let startTime;
  let numTokens = 0;
  let tps;
  let rawBuffer = "";

  const token_callback_function = () => {
    startTime ??= performance.now();
    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
  };

  const callback_function = (output) => {
    rawBuffer += output;
    const { thought, answer, state } = parseThinking(rawBuffer);
    self.postMessage({ status: "update", output: answer, thought, tps, numTokens, state });
  };

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  self.postMessage({ status: "start" });
  stopping_criteria.reset();

  await model.generate({
    ...inputs,
    do_sample: true,
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    max_new_tokens: 1024,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  });

  self.postMessage({ status: "complete" });
}

self.addEventListener("message", async (e) => {
  const { type, data } = e.data;
  switch (type) {
    case "load":
      load();
      break;
    case "generate":
      generate(data);
      break;
    case "interrupt":
      stopping_criteria.interrupt();
      break;
    case "reset":
      stopping_criteria.reset();
      break;
  }
});