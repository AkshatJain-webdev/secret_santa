import { useEffect, useState, useRef, useCallback } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { API_DEFAULT_LIMIT, API_HOST } from "../constants";
import toast from "react-hot-toast";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

type ListParams = {
    skip: number;
    loading: boolean;
    hasMore: boolean;
}

interface IAssignmentListProps {
    handleClick: (id: string) => void;
    refreshList: boolean,
    setRefreshList: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AssignmentList({ handleClick, refreshList, setRefreshList }: IAssignmentListProps) {
    const [listData, setListData] = useState<any[]>([]);
    const [listParams, setListParams] = useState<ListParams>({ skip: 0, loading: false, hasMore: true });
    const observerRef = useRef(null);

    const setListParam = useCallback((key: keyof ListParams, value: any) => {
        setListParams((prev) => ({ ...prev, [key]: value }));
    }, []);


    const getListData = useCallback(async (refreshData: boolean = false) => {
        if (!refreshData && (listParams.loading || !listParams.hasMore)) return;
        try {
            setListParam('loading', true);
            const response = await axios.get(`${API_HOST}/list`, {
                params: { skip: refreshData ? 0 : listParams.skip, limit: API_DEFAULT_LIMIT },
            });
            if (response.status === 200 && response.data.length > 0) {
                setListData((prev) => refreshData ? response.data : [...prev, ...response.data]);
                setListParams((prev) => ({
                    ...prev,
                    skip: (refreshData ? 0 : prev.skip) + API_DEFAULT_LIMIT,
                    hasMore: response.data.length === API_DEFAULT_LIMIT
                }));
            } else {
                setListParam('hasMore', false);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Error fetching data");
        } finally {
            setListParam('loading', false);
        }
    }, [listParams, setListParams, setListParam]);

    useEffect(() => {
        if (!observerRef.current) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                getListData();
            }
        }, { threshold: 1 });

        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [getListData]);

    useEffect(() => {
        if (refreshList) {
            getListData(true);
            setRefreshList(false);
        }
    }, [refreshList, setRefreshList, getListData]);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Employee File</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Previous Assignment File</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Upload date</th>
                                    <th className="relative py-3.5 px-3 sm:pr-0 text-center text-sm font-semibold text-gray-900">Assignments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {listData.map(data => (
                                    <tr key={data.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{data.employeeFile.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data.previousYearFile?.name ?? "N/A"}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{dayjs(data.date).isValid() ? dayjs(data.date).format("DD/MM/YYYY HH:mm:ss") : "N/A"}</td>
                                        <td className="relative whitespace-nowrap py-4 px-3 sm:pr-0 flex justify-center text-sm font-medium">
                                            <ArrowDownTrayIcon onClick={() => handleClick(data.id)} className="h-6 w-6 text-indigo-600 cursor-pointer" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {listParams.loading && <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>}
                        <div ref={observerRef} className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
