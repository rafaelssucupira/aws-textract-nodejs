export default class Utils {
    static formatDate(date) {
        const data = date.match(/(?<day>\d{2})\/?\-?(?<month>\d{2})\/?\-?(?<year>\d{4})/)
        return `${data.groups.year}-${data.groups.month}-${data.groups.day}`
    }

    static normalizeBase64(base64) {
        return Buffer.from(base64.replace(/^data:image\/\w+;base64,|^data:application\/\w+;base64,/, ""), "base64")
    }
}