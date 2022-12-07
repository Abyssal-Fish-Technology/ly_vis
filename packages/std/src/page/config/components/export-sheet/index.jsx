import React from 'react'
import XLSX from 'xlsx'

export default function ExportSheet({ name = 'untitled', data, children }) {
    function onClick() {
        const fileName = `${name}.xlsx`
        const ws = XLSX.utils.book_new()
        const sheet = XLSX.utils.json_to_sheet(data)
        XLSX.utils.book_append_sheet(ws, sheet, name)
        XLSX.writeFile(ws, fileName)
    }
    return <span onClick={onClick}>{children}</span>
}
