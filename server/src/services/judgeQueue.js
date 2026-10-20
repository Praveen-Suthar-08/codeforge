import { executeCodeInSandbox } from '../../../judge/src/executor.js';

// Concurrency-limited FIFO execution queue
class JudgeQueue {
  constructor(concurrency = 4) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  enqueue(job) {
    return new Promise((resolve, reject) => {
      const position = this.queue.length + 1;
      this.queue.push({ job, resolve, reject, position });
      this.processNext();
    });
  }

  async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { job, resolve, reject } = this.queue.shift();
    this.running++;

    try {
      const result = await executeCodeInSandbox(job);
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.processNext();
    }
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export const judgeQueue = new JudgeQueue(4);
