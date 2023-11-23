import { stateAndDispatch } from "../state/AppStateContext"
import * as Actions from "../state/actions"

export async function loadMapFromUrlAsync(src: string): Promise<boolean> {
    const { state, dispatch } = stateAndDispatch()
    try {
        const resp = await fetch(src)
        if (!resp.ok) {
            throw new Error(
                `loadScene: ${src} - ${resp.status}, ${resp.statusText}`
            )
        }
        const body = await resp.text()

        // TODO: Support human-friendly scene syntax, markdown? yaml? natural language?

        //const scene = JSON.parse(body) as SimSpecs.Scene;

        // TODO: validate this is a scene

        //dispatch(Actions.setScene(scene));

        return true
    } catch (e: any) {
        console.error(e.toString())
        return false
    }
}
