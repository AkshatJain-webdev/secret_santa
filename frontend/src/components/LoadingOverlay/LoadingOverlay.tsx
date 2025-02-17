export default function LoadingOverlay({ isLoading, loadingText = 'Loading' }: { isLoading: boolean, loadingText?: string }) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white mt-2 text-lg">{loadingText}...</p>
            </div>
        </div>
    );
}
