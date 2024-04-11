import testBot from "./testBot"
import elecfreakscutebotBot from "./elecfreakscutebot"
import elecfreakscutebotProBot from "./elecfreakscutebotpro"
import dfrobotmaqueenBot from "./dfrobotmaqueen"
import dfrobotmaqueenPlusV2Bot from "./dfrobotmaqueenplusv2"
import yahboomtinybitBot from "./yahboomtinybit"
import fwdeducakit from "./fwdeducakit"

export const BOTS = {
    [elecfreakscutebotBot.productId]: elecfreakscutebotBot,
    [elecfreakscutebotProBot.productId]: elecfreakscutebotProBot,
    [dfrobotmaqueenBot.productId]: dfrobotmaqueenBot,
    [dfrobotmaqueenPlusV2Bot.productId]: dfrobotmaqueenPlusV2Bot,
    [yahboomtinybitBot.productId]: yahboomtinybitBot,
    [yahboomtinybitBot.productId]: yahboomtinybitBot,
    [fwdeducakit.productId]: fwdeducakit,
    [testBot.productId]: testBot,
}

export const DEFAULT_BOT = testBot.productId
