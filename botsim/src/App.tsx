import React, { useEffect, useState } from "react"
import "./App.css"
import { AppStateReady } from "./state/AppStateContext"
import { usePromise } from "./ui/hooks/usePromise"
import { SimContainer } from "./ui/components/SimContainer"
import * as MakeCodeService from "./services/makecodeService"

type Props = {}

export const App: React.FC<Props> = ({}) => {
    const stateReady = usePromise(AppStateReady, false)
    const [appReady, setAppReady] = useState(false)

    useEffect(() => {
        if (!appReady && stateReady) {
            ;(async () => {
                // init application subsystems once app state is ready
                MakeCodeService.init()
            })().then(() => {
                setAppReady(true)
            })
        }
    }, [appReady, stateReady])

    return (
        <div className="app">
            {!appReady && <div>{"loading..."}</div>}
            {appReady && <SimContainer />}
        </div>
    )
}
