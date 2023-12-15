import testBot from "./testBot"
import elecfreakscutebotBot from "./elecfreakscutebot"
import dfrobotmaqueenBot from "./dfrobotmaqueen"

export const BOTS = {
    [elecfreakscutebotBot.productId]: elecfreakscutebotBot,
    [dfrobotmaqueenBot.productId]: dfrobotmaqueenBot,
    [testBot.productId]: testBot,
}

export const DEFAULT_BOT = testBot.productId
