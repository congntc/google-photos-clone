import React, { useEffect } from "react";
import AppLayout from '@/Layouts/app';
import '../assets/css/google-photos-settings.css';

export default function GooglePhotosSettings() {
    useEffect(() => {
        const expandableTriggers = document.querySelectorAll('.expandable-trigger');
        
        const handleClick = function() {
            this.classList.toggle('is-open');
        };

        expandableTriggers.forEach(trigger => {
            trigger.addEventListener('click', handleClick);
        });

        // Cleanup
        return () => {
            expandableTriggers.forEach(trigger => {
                trigger.removeEventListener('click', handleClick);
            });
        };
    }, []);

    return (
        <AppLayout>
           <div className="settings-page-container">
               <h1 className="settings-title">Cài đặt</h1>

                <div className="settings-container">
            
                    <div className="settings-card">

                        <div className="settings-section">
                            <h2 className="settings-group-title">Chất lượng sao lưu ảnh và video</h2>
                            
                            <label className="radio-option">
                                <input type="radio" name="backup-quality" value="original" defaultChecked />
                                <div className="radio-label">
                                    <div className="radio-label-title">Chất lượng gốc</div>
                                    <div className="radio-label-description">Lưu trữ ảnh và video ở chất lượng gốc.</div>
                                </div>
                            </label>

                            <label className="radio-option">
                                <input type="radio" name="backup-quality" value="saver" />
                                <div className="radio-label">
                                    <div className="radio-label-title">Tiết kiệm dung lượng</div>
                                    <div className="radio-label-description">Lưu trữ nhiều nội dung hơn ở mức chất lượng chỉ thấp hơn một chút.</div>
                                </div>
                            </label>

                            <div className="settings-buttons">
                                <a href="#" className="btn-primary">Dùng thử gói 100 GB</a>
                                <a href="#" className="btn-secondary">Quản lý bộ nhớ</a>
                            </div>
                        </div>

                        <hr className="settings-divider" />

                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Giao diện</div>
                                <div className="item-description">Chọn chủ đề màu sắc</div>
                            </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>

                        <div className="expandable-content">
                            <div className="settings-section"> 
                                <label className="radio-option">
                                    <input type="radio" name="theme" value="light" />
                                    <div className="radio-label">
                                        <div className="radio-label-title">Sáng</div>
                                    </div>
                                </label>

                                <label className="radio-option">
                                    <input type="radio" name="theme" value="dark" />
                                    <div className="radio-label">
                                        <div className="radio-label-title">Tối</div>
                                    </div>
                                </label>
                                
                                <label className="radio-option">
                                    <input type="radio" name="theme" value="system" defaultChecked />
                                    <div className="radio-label">
                                        <div className="radio-label-title">Dùng chế độ mặc định của thiết bị</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <hr className="settings-divider" />

                        <div className="settings-item">
                            <div className="item-text">
                                <div className="item-title">Video không được hỗ trợ</div>
                                <div className="item-description">Quản lý các video không thể xử lý của bạn</div>
                            </div>
                            <div className="item-action">
                                <a href="#" className="item-action-link">Xem</a>
                            </div>
                        </div>

                        <hr className="settings-divider" />

                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Đề xuất</div>
                                <div className="item-description">Quản lý các loại nội dung đề xuất mà bạn thấy, chẳng hạn như sửa ảnh bị lệch hoặc đề xuất ảnh ghép</div>
                            </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>

                        <div className="expandable-content">
                            <div className="settings-section">                   
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Tác phẩm</div>
                                        <div className="item-description">Nhận ảnh ghép, ảnh động, video khoảnh khắc nổi bật và nhiều nội dung khác được tạo riêng cho bạn từ ảnh của bạn</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Cách xoay được đề xuất</div>
                                        <div className="item-description">Nhận đề xuất để sửa ảnh bị lệch sang một bên</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item">
                                    <div className="item-text">
                                        <div className="item-title">Đề xuất đã bỏ qua</div>
                                        <div className="item-description">Xem và xóa các đề xuất bạn từng bỏ qua</div>
                                    </div>
                                    <div className="item-action">
                                        <a href="#" className="item-action-link">Xem</a>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item">
                                    <div className="item-text">
                                        <div className="item-title">Tác phẩm sáng tạo chưa lưu</div>
                                        <div className="item-description">Xem, lưu và xóa tác phẩm sáng tạo mà bạn chưa lưu</div>
                                    </div>
                                    <div className="item-action">
                                        <a href="#" className="item-action-link">Xem</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="settings-divider" />

                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Nhóm các khuôn mặt giống nhau</div>
                                <div className="item-description">Quản lý các lựa chọn ưu tiên về Nhóm khuôn mặt</div>
                            </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>
                        <div className="expandable-content">
                            <div className="settings-section">                   
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Nhóm khuôn mặt</div>
                                        <div className="item-description">Xem ảnh có mặt những người mà bạn yêu thích được nhóm theo khuôn mặt tương tự nhau. <a href="#" style={{textDecoration: 'none', color: '#1a73e8'}}>Tìm hiểu thêm</a></div> 
                                        <div className="item-description button-description">
                                            <a href="#" className="btn-secondary">Quản lý bộ nhớ</a>
                                        </div> 
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                            <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Không có khuôn mặt nào được gắn nhãn là "Tôi"</div> 
                                        <div className="item-description">Cá nhân hoá Google Photos bằng cách chọn khuôn mặt của bạn. <br /> <a href="#" style={{textDecoration: 'none', color: '#1a73e8'}}>Tìm hiểu thêm</a></div>     
                                    </div>
                                    <div className="item-action">
                                        <a href="#" className="item-action-link">Chọn</a>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Hiển thị vật nuôi cùng với người</div>     
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="settings-divider" />
                        
                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Kỷ niệm</div>
                                <div className="item-description">Quản lý phân kỷ niệm ở phía trên chế độ xem ảnh. <a href="#" style={{textDecoration: 'none', color: '#1a73e8'}}>Tìm hiểu thêm</a></div>
                            </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>

                        <div className="expandable-content">
                            <div className="settings-section">                   
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ẩn người và thú cưng</div>
                                        <div className="item-description">Bạn sẽ không nhìn thấy khuôn mặt bị ẩn trong kỷ niệm, tác phẩm sáng tạo và trang tìm kiếm của mình</div>
                                    </div>
                                
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ẩn ngày</div>
                                        <div className="item-description">Ảnh chụp vào những ngày bị ẩn sẽ không xuất hiện trong kỷ niệm mới</div>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Kỷ niệm nổi bật</div>
                                        <div className="item-description">Chọn loại kỷ niệm mà bạn muốn xuất hiện nổi bật ở đầu màn hình xem Ảnh</div>
                                    </div>
                                </div>
                                
                                <hr className="settings-divider" />
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Kỷ niệm theo thời gian</div>
                                        <div className="item-description">Ảnh chụp vào những ngày đặc biệt và các năm trước</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh kỷ niệm theo chủ đề</div>
                                        <div className="item-description">Ảnh về con người, địa điểm và sự vật</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh được chia sẻ với bạn</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Tác phẩm</div>
                                        <div className="item-description">Loại tác phẩm</div>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh động</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh có hiệu ứng điện ảnh</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh ghép</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh nổi bật màu</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ảnh cách điệu</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <hr className="settings-divider" />

                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Chia sẻ</div>
                                <div className="item-description">Quản lý các tùy chọn chia sẻ</div>
                            </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>
                        <div className="expandable-content">
                            <div className="settings-section">                   
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Chia sẻ với người thân</div>
                                        <div className="item-description">Tự động chia sẻ ảnh với người thân</div>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item expandable-trigger" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Quản lý hoạt động chia sẻ</div>
                                        <div className="item-description">Quản lý các đường liên kết, kỷ niệm và cuộc trò chuyện được chia sẻ</div>
                                    </div>
                                    <div className="item-action item-action-icon">
                                        <i className="ri-arrow-down-s-line"></i>
                                    </div>
                                </div>
                                <div className="expandable-content">
                                    <div className="settings-section">                   
                                        <div className="settings-item" style={{cursor: 'default'}}>
                                            <div className="item-text">
                                                <div className="item-title">Đường liên kết chia sẻ</div>     
                                            </div>
                                        </div>
                                        <hr className="settings-divider" />
                                        <div className="settings-item" style={{cursor: 'default'}}>
                                            <div className="item-text">
                                                <div className="item-title">Kỷ niệm được chia sẻ</div>     
                                            </div>
                                        </div>
                                        <hr className="settings-divider" />
                                        <div className="settings-item" style={{cursor: 'default'}}>
                                            <div className="item-text">
                                                <div className="item-title">Cuộc trò chuyện</div>     
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-item">
                                    <div className="item-text">
                                        <div className="item-title">Thông báo đề xuất chia sẻ</div>
                                        <div className="item-description">Nhận thông báo khi bạn chia sẻ ảnh mới với bạn bè</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <hr className="settings-divider" />
                                <div className="settings-item">
                                    <div className="item-text">
                                        <div className="item-title">Ẩn video khỏi ảnh chuyển động</div>
                                        <div className="item-description">Người khác sẽ chỉ nhìn thấy ảnh tĩnh</div>
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        <hr className="settings-divider" />
                        
                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Vị trí</div>
                                <div className="item-description">Quản lý dữ liệu vị trí của bạn</div>
                                </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>
                        <div className="expandable-content">
                            <div className="settings-section">                   
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Ước đoán vị trí bị thiếu</div>
                                        <div className="item-description">Sử dụng địa danh và các nguồn khác để ước đoán vị trí bạn đã chụp ảnh. 
                                            <br /> <a href="#" style={{textDecoration: 'none', color: '#1a73e8'}}>Tìm hiểu thêm</a></div>    
                                    </div>
                                    <div className="item-action">
                                        <label className="toggle-switch">
                                            <input type="checkbox" defaultChecked />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>    
                            </div>
                        </div>

                        <hr className="settings-divider" />
                        
                        <div className="settings-item">
                            <div className="item-text">
                                <div className="item-title">Nhật ký đặt hàng ảnh in</div>
                                <div className="item-description">Xem và lưu trữ các đơn đặt hàng trước đây của bạn</div>
                            </div>
                            <div className="item-action">
                                <a href="#" className="item-action-link">Xem</a>
                            </div>
                        </div>
                        
                        <hr className="settings-divider" />

                        <div className="settings-item" style={{cursor: 'default'}}> 
                            <div className="item-text">
                                <div className="item-title">Email nhắc nhở về bản nháp</div>
                                <div className="item-description">Lời nhắc cho biết các bản nháp ảnh in bạn đã tạo sắp hết hạn</div>
                            </div>
                            <div className="item-action">
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        <hr className="settings-divider" />
                        
                        <div className="settings-item" style={{cursor: 'default'}}>
                            <div className="item-text">
                                <div className="item-title">Thông báo của trình duyệt</div>
                                <div className="item-description">Nhận thông báo trên màn hình máy tính này</div>
                            </div>
                            <div className="item-action">
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <hr className="settings-divider" />
                        
                        <div className="settings-item" style={{cursor: 'default'}}>
                            <div className="item-text">
                                <div className="item-title">Cá nhân hoá dựa trên hoạt động</div>
                                <div className="item-description">Bật tính năng cá nhân hoá dựa trên hoạt động cho kỷ niệm và các tính năng khác dựa trên cách bạn dùng Google Photos</div>
                            </div>
                            <div className="item-action">
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <hr className="settings-divider" />
                        
                        <div className="settings-item expandable-trigger">
                            <div className="item-text">
                                <div className="item-title">Xuất dữ liệu</div>
                                <div className="item-description">Tạo bản sao ảnh và video để bạn có thể sử dụng với dịch vụ không phải của Google hoặc giữ làm bản sao lưu bổ sung</div>
                            </div>
                            <div className="item-action item-action-icon">
                                <i className="ri-arrow-down-s-line"></i>
                            </div>
                        </div>
                        <div className="expandable-content">
                            <div className="settings-section">                   
                                <div className="settings-item" style={{cursor: 'default'}}>
                                    <div className="item-text">
                                        <div className="item-title">Sao lưu một bản lưu trữ cho dữ liệu của bạn</div>
                                        <div className="item-description">Chuẩn bị một bản sao lưu ảnh và video để tải xuống hoặc để gửi đến một dịch vụ khác không phải của Google. 
                                            <br /> <a href="#" style={{textDecoration: 'none', color: '#1a73e8'}}>Tìm hiểu thêm</a></div>    
                                    </div>
                                    <div className="item-action">
                                        <a href="#" className="item-action-link">Sao lưu</a>
                                    </div>
                                </div>    
                            </div>
                        </div>
                        
                        <hr className="settings-divider" />
                        
                        <div className="settings-item">
                            <div className="item-text">
                                <div className="item-title">Dữ liệu của bạn trong Google Photos</div>
                                <div className="item-description">Tìm hiểu cách chúng tôi bảo vệ ảnh và video của bạn</div>
                            </div>
                            <div className="item-action">
                                <a href="#" className="item-action-link">Xem</a>
                            </div>
                        </div>

                        <hr className="settings-divider" />

                        <div className="settings-item">
                            <div className="item-text">
                                <div className="item-title">Nhật ký hoạt động</div>
                                <div className="item-description">Xem và xóa tin nhắn cũng như nhận xét của bạn về ảnh được chia sẻ</div>
                            </div>
                            <div className="item-action">
                                <a href="#" className="item-action-link">Xem</a>
                            </div>
                        </div>
                        
                    </div> {/* end settings-card */}
                </div> {/* end settings-container */}
            </div> {/* end settings-page-container */}
        </AppLayout>
    );
}
