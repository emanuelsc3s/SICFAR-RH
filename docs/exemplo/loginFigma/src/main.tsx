import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

function DotsGrid({ cols = 11, rows = 11, size = 9, gap = 17, opacity = 0.5 }: { cols?: number; rows?: number; size?: number; gap?: number; opacity?: number }) {
  return (
    <div
      className="grid relative"
      style={{
        width: 267,
        height: 267,
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap,
        opacity,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="rounded-full border border-[#56aceb]" style={{ width: size, height: size }} />
      ))}
      <div className="absolute inset-0">
        <div />
      </div>
    </div>
  )
}

function Group427() {
  return (
    <div className="fixed right-24 top-16">
      <DotsGrid />
    </div>
  )
}

function Group436() {
  return (
    <div className="fixed right-24 bottom-24">
      <DotsGrid />
    </div>
  )
}

function Group443() {
  return (
    <div className="fixed left-[48%] bottom-24 -translate-x-1/2" style={{ width: 467, height: 192 }}>
      <p className="text-white text-[57px] leading-[64px] tracking-[-0.25px]">Sua ponte de comunicação com o RH</p>
      <div className="absolute top-[137px] left-[133px] flex" style={{ width: 42, height: 42 }}>
        <div className="relative mr-px">
          <div className="w-[14px] h-[14px] rounded-full bg-white" />
          <div className="relative mt-px w-[14px] h-[14px]">
            <div className="absolute -bottom-[14px] -left-px w-[14px] h-[14px] rounded-full bg-white" />
          </div>
        </div>
        <div className="relative ml-px mr-px">
          <div className="w-[14px] h-[14px] rounded-full bg-white" />
          <div className="relative mt-[14px] w-[14px] h-[14px]">
            <div className="absolute -top-[14px] -left-px w-[14px] h-[14px] rounded-full bg-white" />
          </div>
        </div>
        <div className="ml-px">
          <div className="w-[14px] h-[14px] rounded-full bg-white mt-px" />
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <App />
      <Group427 />
      <Group436 />
      <Group443 />
    </>
  </React.StrictMode>,
)

