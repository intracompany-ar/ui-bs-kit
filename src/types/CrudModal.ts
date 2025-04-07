export type CrudModalColumn = {
    value: string;
    title: string;
    valorFijo?: string;
    type: 'text' | 'hidden' | 'select' | 'checkbox' | 'date' | 'number' | 'textarea' | 'file' | 'image'
    selectOptions?: any[];
    valueAux?: string;
}

export type CrudModalType = {
    title: string
    modalId: string
    model: string
    config: {
        large?: boolean
        datatable?: boolean
    }
    columns: CrudModalColumn[]
    parameterRouteName?: string
}