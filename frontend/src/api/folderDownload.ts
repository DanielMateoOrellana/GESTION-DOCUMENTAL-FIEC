import { api } from './http';

export type FolderType = 'category' | 'processType' | 'process' | 'step';

export async function downloadFolder(type: FolderType, id: number): Promise<void> {
    const response = await api.get(`/folder-download/${type}/${id}`, {
        responseType: 'blob',
    });

    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = `descarga.zip`;
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) {
            filename = decodeURIComponent(match[1]);
        }
    }

    // Crear link de descarga
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export async function countFolderFiles(type: FolderType, id: number): Promise<number> {
    const { data } = await api.get<{ count: number }>(`/folder-download/${type}/${id}/count`);
    return data.count;
}
