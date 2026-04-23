import asyncio
import aiohttp
import time
from multiprocessing import Process, Queue, cpu_count
from concurrent.futures import ThreadPoolExecutor

URL = "http://localhost:8000/api/v1/user/register"

# CONFIG — tune this
PROCESSES = cpu_count()        # e.g. 8
THREADS_PER_PROCESS = 5        # threads inside each process
ASYNC_TASKS_PER_THREAD = 20    # async calls per thread

TOTAL_REQUESTS = PROCESSES * THREADS_PER_PROCESS * ASYNC_TASKS_PER_THREAD


def unique_user(i):
    # return {
    #     "username": f"user_{int(time.time()*1000)}_{i}",
    #     "password": f"pass_{i}",
    #     "section": "AI11",
    #     "role": "Student"
    # }
    return {
        "username": "test_user",  # force collision
        "password": f"pass_{i}",
        "section": "AI11",
        "role": "Student"
    }


def classify(status):
    if 200 <= status < 300:
        return "success"
    elif 400 <= status < 500:
        return "client_error"
    elif 500 <= status < 600:
        return "server_error"
    else:
        return "unknown"


# ---------- ASYNC LAYER ----------
async def send(session, user):
    start = time.perf_counter()

    try:
        async with session.post(URL, json=user) as res:
            await res.text()
            duration = time.perf_counter() - start

            return {
                "status": res.status,
                "class": classify(res.status),
                "time": duration
            }

    except Exception as e:
        duration = time.perf_counter() - start

        return {
            "status": 0,
            "class": "network_error",
            "error": str(e),
            "time": duration
        }


async def async_batch(start_index):
    async with aiohttp.ClientSession() as session:
        tasks = [
            send(session, unique_user(start_index + i))
            for i in range(ASYNC_TASKS_PER_THREAD)
        ]
        return await asyncio.gather(*tasks)


# ---------- THREAD LAYER ----------
def thread_worker(start_index):
    return asyncio.run(async_batch(start_index))


# ---------- PROCESS LAYER ----------
def process_worker(proc_id, queue):
    results = []

    with ThreadPoolExecutor(max_workers=THREADS_PER_PROCESS) as executor:
        futures = []

        for t in range(THREADS_PER_PROCESS):
            start_index = proc_id * 100000 + t * ASYNC_TASKS_PER_THREAD
            futures.append(executor.submit(thread_worker, start_index))

        for f in futures:
            results.extend(f.result())

    queue.put(results)


# ---------- MAIN ----------
def main():
    queue = Queue()
    jobs = []

    print(f"\n🚀 Starting hybrid test...")
    print(f"Processes: {PROCESSES}")
    print(f"Threads per process: {THREADS_PER_PROCESS}")
    print(f"Async per thread: {ASYNC_TASKS_PER_THREAD}")
    print(f"Total Requests: {TOTAL_REQUESTS}")

    start_time = time.perf_counter()

    for i in range(PROCESSES):
        p = Process(target=process_worker, args=(i, queue))
        jobs.append(p)
        p.start()

    all_results = []
    for _ in jobs:
        all_results.extend(queue.get())

    for job in jobs:
        job.join()

    end_time = time.perf_counter()
    total_time = end_time - start_time

    # ---------- ANALYSIS ----------
    success = sum(1 for r in all_results if r["class"] == "success")
    client_errors = sum(1 for r in all_results if r["class"] == "client_error")
    server_errors = sum(1 for r in all_results if r["class"] == "server_error")
    network_errors = sum(1 for r in all_results if r["class"] == "network_error")

    times = [r["time"] for r in all_results]

    avg_time = sum(times) / len(times)
    max_time = max(times)
    min_time = min(times)

    times_sorted = sorted(times)
    p95 = times_sorted[int(0.95 * len(times))]
    p99 = times_sorted[int(0.99 * len(times))]

    print("\n===== HYBRID TEST RESULT =====")
    print(f"Total Requests: {len(all_results)}")
    print(f"Success: {success}")
    print(f"Client Errors: {client_errors}")
    print(f"Server Errors: {server_errors}")
    print(f"Network Errors: {network_errors}")

    print("\n===== TIMING =====")
    print(f"Total Time: {total_time:.2f} seconds")
    print(f"Average: {avg_time:.4f} s")
    print(f"Min: {min_time:.4f} s")
    print(f"Max: {max_time:.4f} s")
    print(f"P95: {p95:.4f} s")
    print(f"P99: {p99:.4f} s")


if __name__ == "__main__":
    main()