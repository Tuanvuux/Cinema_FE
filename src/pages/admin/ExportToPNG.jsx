import {useRef} from "react";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import {GradientText} from "@/pages/admin/GradientText.jsx";

export default function ExportToPNG(){
    const ref = useRef();

    const handleExport = () => {
        if (ref.current) {
            toPng(ref.current, {
                backgroundColor: 'transparent',
                pixelRatio: 3, // 👈 tăng tỷ lệ ảnh lên (2 hoặc 3)
            }).then((dataUrl) => {
                download(dataUrl, 'cinex-cinema.png');
            });
        }
    };


    return (
        <div>
            <div
                ref={ref}
                style={{
                    display: 'inline-block',
                    padding: '8px', // tùy chọn: thêm chút khoảng trắng
                    backgroundColor: 'transparent'
                }}
            >
                <GradientText>CineX Cinema</GradientText>
            </div>

            <button onClick={handleExport}>Tải PNG</button>
        </div>
    );
};
