import { useEffect } from "react"
import "./App.css"
import { SimContainer } from "./ui/SimContainer"
import * as MakeCodeService from "./services/makecodeService"

export const App: React.FC = () => {
    useEffect(() => {
        MakeCodeService.init()
    }, [])
    return <div className="app">{<SimContainer />}</div>
}
