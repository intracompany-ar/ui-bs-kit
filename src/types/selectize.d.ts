import 'jquery'

declare module 'jquery' {
    interface JQuery<TElement = HTMLElement> {
        selectize(...args: any[]): this
    }
}