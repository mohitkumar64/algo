"use client"
import React, { useRef } from "react";

const arr = [1, 2, 3, 4, 5, 6, 7,8,9,10,12];

const TreeNode = ({ index , ref }) => {
  if (index >= arr.length) return null;

  const left = 2 * index + 1;
  const right = 2 * index + 2;
    let rect;
  return (
    <div className="flex flex-col items-center relative">
      
      {/* Current Node */}
      <div ref={ref} className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center z-10">
        {arr[index]}
      </div>
        {
             rect = ref.current.getBoundingClientRect();

            console.log(rect);
        }
      {/* Lines */}
      {(left < arr.length || right < arr.length) && (
        <svg
          className="absolute top-12"
          width="200"
          height="100"
        >
          {/* Left line */}
          {left < arr.length && (
            <line
              x1="100"
              y1="0"
              x2="50"
              y2="60"
              stroke="white"
              strokeWidth="2"
            />
          )}

          {/* Right line */}
          {right < arr.length && (
            <line
              x1="100"
              y1="0"
              x2="150"
              y2="60"
              stroke="white"
              strokeWidth="2"
            />
          )}
        </svg>
      )}

      {/* Children */}
      <div className="flex gap-16 mt-16">
        <TreeNode index={left} />
        <TreeNode index={right} />
      </div>
    </div>
  );
};

export default function Algo() {
    const ref = useRef(null);
  return (
    
    <div className="p-10 flex justify-center">
      <TreeNode index={0} ref = {ref} />
    </div>
  );
}