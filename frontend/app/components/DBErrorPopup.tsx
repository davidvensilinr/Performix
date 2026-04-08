"use client";

type Props = {
    onClose: () => void;
};

export default function DBErrorPopup({ onClose }: Props) {
    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-amber-600">!</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Heavy Traffic</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                    We&apos;re experiencing high load on the database right now. Your data is safe — please try again in a moment.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                    You can test locally by running <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">npm run dev</code> with a local DB.
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-semibold rounded-xl transition-all duration-200"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
