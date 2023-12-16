import testBot from "./testBot"
import elecfreakscutebotBot from "./elecfreakscutebot"
import elecfreakscutebotProBot from "./elecfreakscutebotpro"
import dfrobotmaqueenBot from "./dfrobotmaqueen"
import dfrobotmaqueenPlusV2Bot from "./dfrobotmaqueenplusv2"
import yahboomtinybitBot from "./yahboomtinybit"

export const BOTS = {
    [elecfreakscutebotBot.productId]: elecfreakscutebotBot,
    [elecfreakscutebotProBot.productId]: elecfreakscutebotProBot,
    [dfrobotmaqueenBot.productId]: dfrobotmaqueenBot,
    [dfrobotmaqueenPlusV2Bot.productId]: dfrobotmaqueenPlusV2Bot,
    [yahboomtinybitBot.productId]: yahboomtinybitBot,
    [testBot.productId]: testBot,
}

export const DEFAULT_BOT = testBot.productId
