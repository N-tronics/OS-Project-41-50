import { useState, useEffect } from "react";

export default function MemorySystemCallsVisualization() {
	const [memoryBlocks, setMemoryBlocks] = useState([]);
	const [activeCall, setActiveCall] = useState(null);
	const [callDescription, setCallDescription] = useState("");
	const [showHelp, setShowHelp] = useState(false);
	const [customSize, setCustomSize] = useState(100);
	const [customAnimation, setCustomAnimation] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);

	// Initialize memory with proper memory layout including stack, heap, etc.
	useEffect(() => {
		resetMemoryToDefault();
	}, []);

	const resetMemoryToDefault = () => {
		setMemoryBlocks([
			{
				id: 1,
				start: 0,
				size: 100,
				type: "kernel",
				color: "bg-red-300",
				label: "Kernel Space",
			},
			{
				id: 2,
				start: 100,
				size: 100,
				type: "text",
				color: "bg-yellow-300",
				label: "Text Segment (Code)",
			},
			{
				id: 3,
				start: 200,
				size: 80,
				type: "data",
				color: "bg-pink-300",
				label: "Data Segment",
			},
			{
				id: 4,
				start: 280,
				size: 40,
				type: "bss",
				color: "bg-orange-300",
				label: "BSS",
			},
			{
				id: 5,
				start: 320,
				size: 80,
				type: "heap",
				color: "bg-green-400",
				label: "Heap",
			},
			{
				id: 6,
				start: 400,
				size: 300,
				type: "free",
				color: "bg-gray-200",
				label: "Free Memory",
			},
			{
				id: 7,
				start: 700,
				size: 200,
				type: "mmap",
				color: "bg-purple-400",
				label: "Memory Mapped",
			},
			{
				id: 8,
				start: 900,
				size: 100,
				type: "stack",
				color: "bg-blue-400",
				label: "Stack",
			},
		]);
	};

	const systemCallDescriptions = {
		brk: "brk()/sbrk() - Changes the location of the program break, which defines the end of the process's data segment. Increases available heap memory for the process.",
		mmap: "mmap() - Maps files or devices into memory. Creates a new mapping in the virtual address space of the calling process. Allows file I/O through memory access.",
		munmap:
			"munmap() - Unmaps memory regions previously mapped with mmap(). Removes mappings for the specified address range.",
		mprotect:
			"mprotect() - Changes protection for a memory region. Can make memory readable, writable, executable, or combinations of these permissions.",
		stackGrow:
			"Stack growth - When functions are called or local variables are allocated, the stack automatically grows downward (in typical architectures). This is managed by the CPU/kernel.",
		malloc:
			"malloc() - C library function that uses brk() or mmap() system calls to allocate memory on the heap. This is not a system call itself but a higher-level function.",
	};

	const handleBrk = () => {
		setActiveCall("brk");
		setCallDescription(systemCallDescriptions.brk);

		// Animate the change
		setCustomAnimation(true);
		setTimeout(() => setCustomAnimation(false), 800);

		// Find heap and the adjacent free block
		const heapIndex = memoryBlocks.findIndex((block) => block.type === "heap");
		const freeBlockIndex = memoryBlocks.findIndex(
			(block) =>
				block.type === "free" &&
				memoryBlocks[heapIndex].start + memoryBlocks[heapIndex].size ===
					block.start
		);

		if (heapIndex >= 0 && freeBlockIndex >= 0) {
			// Clone the blocks array
			let newBlocks = [...memoryBlocks];
			const heapBlock = newBlocks[heapIndex];
			const freeBlock = newBlocks[freeBlockIndex];

			// Calculate growth size (limited by free space available)
			const growSize = Math.min(customSize, freeBlock.size);

			// Update heap size
			newBlocks[heapIndex] = {
				...heapBlock,
				size: heapBlock.size + growSize,
			};

			// Update free block
			newBlocks[freeBlockIndex] = {
				...freeBlock,
				start: freeBlock.start + growSize,
				size: freeBlock.size - growSize,
			};

			setMemoryBlocks(newBlocks);
		}
	};

	const handleMmap = () => {
		setActiveCall("mmap");
		setCallDescription(systemCallDescriptions.mmap);

		// Animate the change
		setCustomAnimation(true);
		setTimeout(() => setCustomAnimation(false), 800);

		// Find a free block to map file into
		let newBlocks = [...memoryBlocks];
		const allocSize = Math.min(customSize, 200); // Limit to reasonable size
		const freeBlockIndex = newBlocks.findIndex(
			(block) => block.type === "free" && block.size >= allocSize
		);

		if (freeBlockIndex >= 0) {
			const freeBlock = newBlocks[freeBlockIndex];
			const newSize = freeBlock.size - allocSize;

			if (newSize > 0) {
				// Split the block
				newBlocks[freeBlockIndex] = {
					...freeBlock,
					size: newSize,
					start: freeBlock.start + allocSize,
				};

				newBlocks.splice(freeBlockIndex, 0, {
					id: Date.now(),
					start: freeBlock.start,
					size: allocSize,
					type: "mmap",
					color: "bg-purple-400",
					label: "Memory Mapped",
				});
			} else {
				// Use whole block
				newBlocks[freeBlockIndex] = {
					...freeBlock,
					type: "mmap",
					color: "bg-purple-400",
					label: "Memory Mapped",
				};
			}

			setMemoryBlocks(newBlocks);
		}
	};

	const handleMunmap = () => {
		setActiveCall("munmap");
		setCallDescription(systemCallDescriptions.munmap);

		// Animate the change
		setCustomAnimation(true);
		setTimeout(() => setCustomAnimation(false), 800);

		// Find a mmapped block to unmap
		let newBlocks = [...memoryBlocks];
		const mmapBlockIndex = newBlocks.findIndex(
			(block) => block.type === "mmap"
		);

		if (mmapBlockIndex >= 0) {
			newBlocks[mmapBlockIndex] = {
				...newBlocks[mmapBlockIndex],
				type: "free",
				color: "bg-gray-200",
				label: "Free Memory",
			};

			// Try to merge with adjacent free blocks (simplified)
			setMemoryBlocks(newBlocks);
		}
	};

	const handleMprotect = () => {
		setActiveCall("mprotect");
		setCallDescription(systemCallDescriptions.mprotect);

		// Animate the change
		setCustomAnimation(true);
		setTimeout(() => setCustomAnimation(false), 800);

		// Find a block to change protection (excluding free and kernel)
		let newBlocks = [...memoryBlocks];
		const blockIndex = newBlocks.findIndex(
			(block) => block.type !== "free" && block.type !== "kernel"
		);

		if (blockIndex >= 0) {
			// Visual indication of protection change
			const block = newBlocks[blockIndex];
			const originalColor = block.color;

			// Toggle protection state
			newBlocks[blockIndex] = {
				...block,
				color: originalColor.includes("protected")
					? originalColor.replace("-protected", "")
					: originalColor + "-protected",
				label:
					block.label +
					(originalColor.includes("protected") ? "" : " (Protected)"),
			};

			setMemoryBlocks(newBlocks);
		}
	};

	const handleStackGrow = () => {
		setActiveCall("stackGrow");
		setCallDescription(systemCallDescriptions.stackGrow);

		// Animate the change
		setCustomAnimation(true);
		setTimeout(() => setCustomAnimation(false), 800);

		// Find stack block
		let newBlocks = [...memoryBlocks];
		const stackIndex = newBlocks.findIndex((block) => block.type === "stack");

		if (stackIndex >= 0) {
			const stackBlock = newBlocks[stackIndex];

			// Check if free space is available before the stack
			const freeBeforeStackIndex = newBlocks.findIndex(
				(block) =>
					block.type === "free" && block.start + block.size === stackBlock.start
			);

			if (freeBeforeStackIndex >= 0) {
				const freeBlock = newBlocks[freeBeforeStackIndex];
				const growSize = Math.min(30, freeBlock.size); // Stack typically grows in smaller chunks

				// Update stack size and position (stack grows downward)
				newBlocks[stackIndex] = {
					...stackBlock,
					start: stackBlock.start - growSize,
					size: stackBlock.size + growSize,
				};

				// Update free block
				newBlocks[freeBeforeStackIndex] = {
					...freeBlock,
					size: freeBlock.size - growSize,
				};

				setMemoryBlocks(newBlocks);
			}
		}
	};

	const handleMalloc = () => {
		setActiveCall("malloc");
		setCallDescription(systemCallDescriptions.malloc);

		// Animate the change
		setCustomAnimation(true);
		setTimeout(() => setCustomAnimation(false), 800);

		// Find a space in existing heap or expand heap
		let newBlocks = [...memoryBlocks];
		const heapIndex = newBlocks.findIndex((block) => block.type === "heap");

		if (heapIndex >= 0) {
			// Simulate internal heap fragmentation by splitting the heap
			const heapBlock = newBlocks[heapIndex];
			const allocSize = Math.min(customSize / 2, heapBlock.size - 10); // Ensure we leave some heap space

			if (allocSize > 0) {
				// Split the heap block
				const newHeapSize = heapBlock.size - allocSize;

				if (newHeapSize > 10) {
					// Ensure we keep some heap space
					// Create allocated block within heap
					const newAllocatedBlock = {
						id: Date.now(),
						start: heapBlock.start + newHeapSize,
						size: allocSize,
						type: "allocated",
						color: "bg-green-600",
						label: "Allocated (malloc)",
					};

					// Resize heap
					newBlocks[heapIndex] = {
						...heapBlock,
						size: newHeapSize,
					};

					// Insert new block after heap
					newBlocks.splice(heapIndex + 1, 0, newAllocatedBlock);

					setMemoryBlocks(newBlocks);
				} else {
					// Not enough space, so call brk() to expand heap first
					handleBrk();
				}
			}
		}
	};

	const resetMemory = () => {
		setActiveCall(null);
		setCallDescription("");
		resetMemoryToDefault();
	};

	return (
		<div className="p-6 bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-xl shadow-2xl text-gray-100 h-screen px-32">
			<h1 className="text-3xl font-bold mb-6 text-center text-white py-10 ">
				Process Memory Layout Visualization
			</h1>

			<div className="mb-8 ">
				<div className="bg-gray-700 p-6 rounded-lg shadow-lg mb-6">
					<div className="mb-4">
						<label className="block text-sm font-medium mb-2">
							Allocation Size:
						</label>
						<div className="flex items-center">
							<input
								type="range"
								min="10"
								max="200"
								value={customSize}
								onChange={(e) => setCustomSize(parseInt(e.target.value))}
								className="w-full mr-4 accent-blue-500"
							/>
							<span className="bg-gray-600 px-3 py-1 rounded-md text-blue-300 font-mono">
								{customSize} units
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
						<button
							onClick={handleBrk}
							className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
								activeCall === "brk"
									? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30"
									: "bg-gray-600 hover:bg-gray-500"
							}`}
						>
							brk()/sbrk()
						</button>
						<button
							onClick={handleMmap}
							className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
								activeCall === "mmap"
									? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30"
									: "bg-gray-600 hover:bg-gray-500"
							}`}
						>
							mmap()
						</button>
						<button
							onClick={handleMunmap}
							className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
								activeCall === "munmap"
									? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30"
									: "bg-gray-600 hover:bg-gray-500"
							}`}
						>
							munmap()
						</button>
						<button
							onClick={handleMprotect}
							className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
								activeCall === "mprotect"
									? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-600/30"
									: "bg-gray-600 hover:bg-gray-500"
							}`}
						>
							mprotect()
						</button>
						<button
							onClick={handleStackGrow}
							className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
								activeCall === "stackGrow"
									? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30"
									: "bg-gray-600 hover:bg-gray-500"
							}`}
						>
							Stack Growth
						</button>
						<button
							onClick={handleMalloc}
							className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
								activeCall === "malloc"
									? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30"
									: "bg-gray-600 hover:bg-gray-500"
							}`}
						>
							malloc()
						</button>
					</div>

					<div className="grid grid-cols-3 gap-3">
						<button
							onClick={resetMemory}
							className="px-4 py-3 rounded-lg font-medium bg-red-700 hover:bg-red-600 transition-all duration-300"
						>
							Reset
						</button>
						<button
							onClick={() => setShowHelp((prev) => !prev)}
							className="px-4 py-3 rounded-lg font-medium bg-teal-700 hover:bg-teal-600 transition-all duration-300"
						>
							{showHelp ? "Hide Help" : "Show Help"}
						</button>
						<button
							onClick={() => setShowAdvanced((prev) => !prev)}
							className="px-4 py-3 rounded-lg font-medium bg-amber-700 hover:bg-amber-600 transition-all duration-300"
						>
							{showAdvanced ? "Hide Details" : "Show Details"}
						</button>
					</div>
				</div>

				{callDescription && (
					<div
						className={`p-5 bg-gray-700 rounded-lg mb-6 border-l-4 border-blue-500 shadow-lg ${
							customAnimation ? "animate-pulse" : ""
						}`}
					>
						<p className="text-gray-300">{callDescription}</p>
					</div>
				)}
			</div>

			{/* Memory visualization - taller to show more details */}
			<div
				className={`relative h-40 mb-6 border border-gray-600 rounded-lg shadow-lg overflow-hidden ${
					customAnimation ? "animate-pulse" : ""
				}`}
			>
				<div className="absolute top-0 left-0 w-full h-full flex">
					{memoryBlocks.map((block) => (
						<div
							key={block.id}
							className={`h-full ${block.color} border-r border-gray-700 transition-all duration-500 relative group overflow-hidden`}
							style={{ width: `${(block.size / 1000) * 100}%` }}
						>
							<div className="text-xs p-2 font-mono text-gray-800 flex flex-col justify-between h-full">
								<div>{block.label}</div>
								{showAdvanced && (
									<div className="text-gray-700 text-xs">
										{block.start}-{block.start + block.size}
									</div>
								)}
							</div>
							<div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
						</div>
					))}
				</div>

				{/* Memory scale indicators */}
				<div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-xs text-gray-400">
					<span>0</span>
					<span>250</span>
					<span>500</span>
					<span>750</span>
					<span>1000</span>
				</div>
			</div>

			{/* Memory regions diagram - showing high to low addresses */}
			{showAdvanced && (
				<div className="mb-6 p-4 bg-gray-700 rounded-lg shadow-lg">
					<h3 className="text-lg font-semibold mb-4 text-blue-300">
						Virtual Memory Layout (High → Low Address)
					</h3>
					<div className="flex flex-col space-y-1">
						<div className="bg-red-300 p-2 rounded text-gray-800 font-mono text-sm">
							Kernel Space (Higher addresses)
						</div>
						<div className="bg-blue-400 p-2 rounded text-gray-800 font-mono text-sm">
							Stack (grows downward ↓)
						</div>
						<div className="bg-gray-200 p-2 rounded text-gray-800 font-mono text-sm">
							Free Memory Space
						</div>
						<div className="bg-purple-400 p-2 rounded text-gray-800 font-mono text-sm">
							Memory Mapped Region (shared libraries, files)
						</div>
						<div className="bg-gray-200 p-2 rounded text-gray-800 font-mono text-sm">
							Free Memory Space
						</div>
						<div className="bg-green-400 p-2 rounded text-gray-800 font-mono text-sm">
							Heap (grows upward ↑)
						</div>
						<div className="bg-orange-300 p-2 rounded text-gray-800 font-mono text-sm">
							BSS Segment (uninitialized data)
						</div>
						<div className="bg-pink-300 p-2 rounded text-gray-800 font-mono text-sm">
							Data Segment (initialized data)
						</div>
						<div className="bg-yellow-300 p-2 rounded text-gray-800 font-mono text-sm">
							Text Segment (Program code) (Lower addresses)
						</div>
					</div>
				</div>
			)}

			{/* Legend */}
			<div className="flex flex-wrap gap-4 p-4 bg-gray-700 rounded-lg shadow-lg">
				<div className="flex items-center">
					<div className="w-5 h-5 bg-red-300 mr-2 rounded"></div>
					<span className="text-sm">Kernel</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-yellow-300 mr-2 rounded"></div>
					<span className="text-sm">Text</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-pink-300 mr-2 rounded"></div>
					<span className="text-sm">Data</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-orange-300 mr-2 rounded"></div>
					<span className="text-sm">BSS</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-green-400 mr-2 rounded"></div>
					<span className="text-sm">Heap</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-blue-400 mr-2 rounded"></div>
					<span className="text-sm">Stack</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-purple-400 mr-2 rounded"></div>
					<span className="text-sm">mmap</span>
				</div>
				<div className="flex items-center">
					<div className="w-5 h-5 bg-gray-200 mr-2 rounded"></div>
					<span className="text-sm">Free</span>
				</div>
			</div>

			{/* Help section */}
			{showHelp && (
				<div className="mt-6 p-6 bg-gray-700 rounded-lg shadow-lg border-t border-gray-600">
					<h3 className="font-bold text-xl mb-4 text-blue-300">
						Process Memory Layout Explanation:
					</h3>
					<ul className="space-y-3 mb-6">
						<li className="pl-4 border-l-2 border-red-400">
							<strong className="text-red-300">Kernel Space</strong> - Reserved
							for kernel code and data structures. User processes cannot
							directly access this memory region.
						</li>
						<li className="pl-4 border-l-2 border-yellow-400">
							<strong className="text-yellow-300">Text Segment</strong> -
							Contains executable code of the program. Typically read-only to
							prevent modification.
						</li>
						<li className="pl-4 border-l-2 border-pink-400">
							<strong className="text-pink-300">Data Segment</strong> - Contains
							initialized global and static variables with pre-defined values.
						</li>
						<li className="pl-4 border-l-2 border-orange-400">
							<strong className="text-orange-300">BSS Segment</strong> -
							Contains uninitialized global and static variables, initialized to
							zero by the kernel.
						</li>
						<li className="pl-4 border-l-2 border-green-400">
							<strong className="text-green-300">Heap</strong> - Dynamic memory
							allocation region that grows upward. Managed by brk()/sbrk()
							system calls or malloc() library functions.
						</li>
						<li className="pl-4 border-l-2 border-purple-400">
							<strong className="text-purple-300">Memory Mapped Region</strong>{" "}
							- Used for shared libraries, file mappings, and additional memory
							allocations via mmap().
						</li>
						<li className="pl-4 border-l-2 border-blue-400">
							<strong className="text-blue-300">Stack</strong> - Contains
							function call frames, local variables, and return addresses. Grows
							downward in memory.
						</li>
					</ul>

					<h3 className="font-bold text-xl mb-4 text-blue-300">
						System Call Explanations:
					</h3>
					<ul className="space-y-3 mb-6">
						<li className="pl-4 border-l-2 border-green-400">
							<strong className="text-green-300">brk()/sbrk()</strong> -
							Traditional system calls to increase/decrease program break point,
							expanding or shrinking process heap space.
						</li>
						<li className="pl-4 border-l-2 border-purple-400">
							<strong className="text-purple-300">mmap()</strong> - Maps files
							or devices into memory address space. Used for file I/O, shared
							memory, and memory allocation.
						</li>
						<li className="pl-4 border-l-2 border-indigo-400">
							<strong className="text-indigo-300">munmap()</strong> - Removes a
							mapping established by mmap(), freeing memory back to the system.
						</li>
						<li className="pl-4 border-l-2 border-yellow-400">
							<strong className="text-yellow-300">mprotect()</strong> - Changes
							access protections for memory pages, allowing/restricting read,
							write, or execute permissions.
						</li>
						<li className="pl-4 border-l-2 border-blue-400">
							<strong className="text-blue-300">Stack Growth</strong> - When
							functions are called or local variables declared, stack space
							expands automatically. Managed by the processor/kernel.
						</li>
						<li className="pl-4 border-l-2 border-emerald-400">
							<strong className="text-emerald-300">malloc()</strong> - C library
							function that uses underlying system calls (brk or mmap) to
							allocate memory on the heap.
						</li>
					</ul>
				</div>
			)}
		</div>
	);
}

