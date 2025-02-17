import axios from "axios";
import React from "react";
import { useDropzone } from "react-dropzone";
import { API_HOST } from "../constants";
import toast, { Toaster } from "react-hot-toast";
import { ArrowUpTrayIcon, GiftIcon } from "@heroicons/react/24/solid";
import LoadingOverlay from "./LoadingOverlay/LoadingOverlay";
import AssignmentList from "./AssignmentList";

type UploadFileState = {
    employeesFile: File | null,
    previousAssignment: File | null
}
const defaultFilesState: UploadFileState = {
    employeesFile: null,
    previousAssignment: null
}

export default function Home() {
    const [loadingState, setLoadingState] = React.useState<{ loading: boolean, text: string }>({ loading: false, text: 'Loading' });
    const [files, setFiles] = React.useState<UploadFileState>({ ...defaultFilesState });
    const [refreshList, setRefreshList] = React.useState<boolean>(false)

    const onEmployeesDrop = (acceptedFiles: File[]) => {
        setFiles((files) => ({ ...files, employeesFile: acceptedFiles[0] }))
    };

    const onPreviousAssignmentsDrop = (acceptedFiles: File[]) => {
        setFiles((files) => ({ ...files, previousAssignment: acceptedFiles[0] }))
    };

    const { getRootProps: getEmployeesRootProps, getInputProps: getEmployeesInputProps } = useDropzone({
        onDrop: onEmployeesDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    const { getRootProps: getPreviousRootProps, getInputProps: getPreviousInputProps } = useDropzone({
        onDrop: onPreviousAssignmentsDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    const generateAssignments = async () => {
        try {
            setLoadingState({ loading: true, text: 'Generating assignments' })
            if (!files.employeesFile) throw new Error('Assignment cannot be generated without employee data')
            const formData = new FormData();
            formData.append('files', files.employeesFile);
            if (files.previousAssignment) {
                formData.append('files', files.previousAssignment);
            }
            const res = await axios.post(`${API_HOST}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            if ([200, 201].includes(res.status)) {
                toast.success('Secret santa assignments generated')
                setFiles({ ...defaultFilesState })
                setRefreshList(true);
                void downloadAssignment(res.data.id);
            } else {
                throw new Error()
            }
        } catch (err: any) {
            setLoadingState({ loading: false, text: 'Loading' })
            console.log(err);
            toast.error('Something went wrong, try again later')
        }
    };

    const downloadAssignment = async (fileMappingId: string) => {
        try {
            setLoadingState({ loading: true, text: 'Downloading assignment' });
            const response = await axios.get(`${API_HOST}/download/`.concat(fileMappingId), {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = response.headers['content-disposition']?.split('filename=')[1].split(';')[0];
            link.setAttribute('download', fileName ?? 'assignment.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading the file:', error);
            toast.error('Error downloading the file')
        } finally {
            setLoadingState({ loading: false, text: 'Loading' })
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <LoadingOverlay isLoading={loadingState.loading} loadingText={loadingState.text} />
            <div className="text-center mb-12">
                <GiftIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Secret Santa Generator</h1>
                <p className="text-lg text-gray-600">Upload your employee list and generate Secret Santa assignments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                    {...getEmployeesRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                >
                    <input {...getEmployeesInputProps()} />
                    <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Drop employees CSV file here</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {files.employeesFile?.name ?? 'No file uploaded'}
                    </p>
                </div>

                <div
                    {...getPreviousRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                >
                    <input {...getPreviousInputProps()} />
                    <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Drop previous assignments CSV (optional)</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {files.previousAssignment?.name ?? 'No file uploaded'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={generateAssignments}
                    disabled={files.employeesFile == null}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Assignments
                </button>
            </div>

            <AssignmentList refreshList={refreshList} setRefreshList={setRefreshList} handleClick={downloadAssignment} />

            <Toaster position="top-right" />
        </div>
    );
}