import testBot from "./testBot"
import elecfreakscutebotBot from "./elecfreakscutebot"
import dfrobotmaqueenBot from "./dfrobotmaqueen"
import yahboomtinybitBot from "./yahboomtinybit"

export const BOTS = {
    [elecfreakscutebotBot.productId]: elecfreakscutebotBot,
    [dfrobotmaqueenBot.productId]: dfrobotmaqueenBot,
    [yahboomtinybitBot.productId]: yahboomtinybitBot,
    [testBot.productId]: testBot,
}

export const DEFAULT_BOT = testBot.productId
