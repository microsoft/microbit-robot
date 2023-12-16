import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Simulation } from "../sim"
import { Vec2 } from "../types/vec2"

type Props = {}

export const SimContainer: React.FC<Props> = ({}) => {
    const [simContainer, setSimContainer] = useState<HTMLDivElement>()

    // Get the simulator instance and run it as long as we're mounted
    useEffect(() => {
        return () => {
            Simulation.instance.clear()
            Simulation.instance.stop()
        }
    }, [])

    // Add the simulator to the div once we have the ref.
    // Ensure container has no existing children, because React.
    useEffect(() => {
        if (simContainer && !simContainer.firstChild) {
            simContainer.append(Simulation.instance.renderer.handle as any)
        }
    }, [simContainer])

    // Hook mouse events
    useEffect(() => {
        if (simContainer) {
            const handleMouseDown = (e: MouseEvent) => {
                if (e.button === 0) {
                    const p = Vec2.like(e.offsetX, e.offsetY)
                    Simulation.instance.mouseDown(p)
                }
            }
            const handleMouseMove = (e: MouseEvent) => {
                const p = Vec2.like(e.offsetX, e.offsetY)
                Simulation.instance.mouseMove(p)
            }
            const handleMouseUp = (e: MouseEvent) => {
                if (e.button === 0) {
                    const p = Vec2.like(e.offsetX, e.offsetY)
                    Simulation.instance.mouseUp(p)
                }
            }
            simContainer.addEventListener("mousedown", handleMouseDown)
            simContainer.addEventListener("mousemove", handleMouseMove)
            simContainer.addEventListener("mouseup", handleMouseUp)
            return () => {
                simContainer.removeEventListener("mousedown", handleMouseDown)
                simContainer.removeEventListener("mousemove", handleMouseMove)
                simContainer.removeEventListener("mouseup", handleMouseUp)
            }
        }
    }, [simContainer])

    const handleDivRef = (ref: HTMLDivElement) => {
        setSimContainer(ref)
    }

    return <div className="sim-container" ref={handleDivRef}></div>
}
