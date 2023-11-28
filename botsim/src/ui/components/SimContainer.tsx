import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Simulation } from "../../sim"
import { MAPS } from "../../maps"
import { BOTS } from "../../bots"

type Props = {}

export const SimContainer: React.FC<Props> = ({}) => {
    const [simContainer, setSimContainer] = useState<HTMLDivElement>()
    const [sim, setSim] = useState<Simulation>()
    const fetchSim = useRef(true)

    // Get the simulator instance and run it as long as we're mounted
    useEffect(() => {
        if (fetchSim.current) {
            fetchSim.current = false
            Simulation.getAsync().then((s) => {
                setSim(s)
            })
        }
        return () => {
            sim?.clear()
            sim?.stop()
        }
    }, [])

    // Add the simulator to the div once we have the ref.
    // Ensure container has no existing children, because React.
    useEffect(() => {
        if (sim && simContainer && !simContainer.firstChild) {
            simContainer.append(sim.renderer.handle as any)
        }
    }, [simContainer, sim])

    const handleDivRef = (ref: HTMLDivElement) => {
        setSimContainer(ref)
    }

    if (!sim) {
        return <div>{"loading..."}</div>
    } else {
        return <div className="sim-container" ref={handleDivRef}></div>
    }
}
