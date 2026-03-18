const queue = [];

let processing = false;

export function addJob(job) {
  queue.push(job);

  processQueue();
}

async function processQueue() {
  if (processing) return;

  processing = true;

  while (queue.length > 0) {
    const job = queue.shift();

    try {
      await job();
    } catch (error) {
      console.error("Job failed:", error);
    }
  }

  processing = false;
}
