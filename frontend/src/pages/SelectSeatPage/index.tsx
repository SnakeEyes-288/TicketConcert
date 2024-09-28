import React, { useState, useEffect } from 'react';
import { Button, Card, Spin, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { GetSeatsByConsertId, GetSeatType } from '../../services/https';
import './index.css'; // นำเข้า CSS ที่กำหนดเอง

//const { Title } = Typography;

const SeatSelection: React.FC = () => {
    const [seatsData, setSeatsData] = useState<any[]>([]);
    const [groupedSeats, setGroupedSeats] = useState<any>({});
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [selectedSeatType, setSelectedSeatType] = useState<number | null>(null);
    //const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [selectedConcert, setSelectedConcert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [seatDetails, setSeatDetails] = useState<any[]>([]);  // State ใหม่สำหรับรายละเอียดที่นั่ง
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.selectedConcert) {
            setSelectedConcert(location.state.selectedConcert);
        }
    }, [location]);

    useEffect(() => {
        const fetchSeatsAndTypes = async () => {
            if (selectedConcert && selectedConcert.ID) {
                try {
                    const seats = await GetSeatsByConsertId(selectedConcert.ID);
                    const seatTypeResponse = await GetSeatType();

                    if (Array.isArray(seats) && seatTypeResponse?.data && Array.isArray(seatTypeResponse.data)) {
                        const seatTypes = seatTypeResponse.data;

                        const seatsWithDetails = seats.map(seat => {
                            const seatType = seatTypes.find((type: { ID: any; }) => type.ID === seat.SeatTypeID);
                            return {
                                ...seat,
                                SeatTypeName: seatType ? seatType.Name : 'ไม่ทราบ',
                                SeatTypePrice: seatType ? seatType.Price : 0
                            };
                        });

                        // Group seats by zone
                        const grouped = seatsWithDetails.reduce((acc: any, seat: any) => {
                            const zone = seat.SeatTypeName || 'อื่นๆ';
                            if (!acc[zone]) acc[zone] = [];
                            acc[zone].push(seat);
                            return acc;
                        }, {});

                        setGroupedSeats(grouped);
                        setSeatsData(seatsWithDetails);
                        setError('');
                    } else {
                        setError('ไม่พบที่นั่งหรือประเภทที่นั่งสำหรับคอนเสิร์ตนี้');
                    }
                } catch (error) {
                    setError('ไม่สามารถดึงข้อมูลที่นั่งหรือประเภทที่นั่งได้');
                }
            } else {
                setError('ไม่พบคอนเสิร์ตที่เลือก');
            }
            setLoading(false);
        };
        fetchSeatsAndTypes();
    }, [selectedConcert]);

    const handleSeatClick = (seatNumber: string, seatTypeId: number, isAvailable: boolean) => {
        if (!isAvailable) {
            alert('ที่นั่งนี้ถูกจองไปแล้ว');
            return;
        }
    
        // ตรวจสอบจำนวนที่นั่งที่เลือก ถ้ามีการเลือก 4 ที่แล้ว จะไม่ให้เลือกเพิ่ม
        if (selectedSeats.length >= 4 && !selectedSeats.includes(seatNumber)) {
            alert('คุณสามารถเลือกที่นั่งได้ไม่เกิน 4 ที่');
            return;
        }
    
        if (selectedSeatType && selectedSeatType !== seatTypeId && selectedSeats.length > 0) {
            alert('กรุณาเลือกที่นั่งประเภทเดียวกัน');
            return;
        }
    
        setSelectedSeats(prev => {
            const updatedSeats = prev.includes(seatNumber)
                ? prev.filter(seat => seat !== seatNumber)
                : [...prev, seatNumber];
    
            // Update seat type when no seats are selected
            if (updatedSeats.length === 0) setSelectedSeatType(null);
            else setSelectedSeatType(seatTypeId);
    
            // Update seatDetails to include detailed information about selected seats
            const selectedDetails = seatsData.filter(seat => updatedSeats.includes(seat.SeatNumber));
            setSeatDetails(selectedDetails); // อัปเดต seatDetails ด้วยข้อมูลของที่นั่งที่เลือก
    
            return updatedSeats;
        });
    };

    const handleProceed = () => {
        if (selectedSeats.length === 0) {
            alert('กรุณาเลือกอย่างน้อย 1 ที่นั่ง');
            return;
        }

        const ticketQuantity = selectedSeats.length;
        const selectedSeatDetails: any = seatsData.find(seat => seat.SeatTypeID === selectedSeatType);
        const ticketPrice = selectedSeatDetails?.SeatTypePrice || 0;
        const selectedSeatTypeName = selectedSeatDetails?.SeatTypeName || 'ไม่ทราบ';

        navigate('/payment', {
            state: {
                selectedConcert: selectedConcert?.name,
                selectedSeats,
                selectedSeatType: selectedSeatTypeName,
                ticketQuantity,
                ticketPrice,
            },
        });
    };

    return (
        <div className="seat-selection-container">
            <div className="stage-indicator">STAGE</div>

            {error && <Alert message={error} type="error" showIcon />}
            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="seat-grid">
                    {Object.keys(groupedSeats).map((zone, rowIndex) => (
                        <div key={zone} className="zone-row">
                            <div className="seat-row-label">{zone}</div>
                            {groupedSeats[zone].map((seat: any) => (
                                <div
                                    key={seat.SeatNumber}
                                    className={`seat ${seat.IsAvailable ? 'available' : 'unavailable'} ${
                                        selectedSeats.includes(seat.SeatNumber) ? 'selected' : ''
                                    }`}
                                    onClick={() => handleSeatClick(seat.SeatNumber, seat.SeatTypeID, seat.IsAvailable)}
                                >
                                    {seat.IsAvailable ? '✔️' : '❌'}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

{seatDetails.length > 0 && ( 
    <Card 
        title="รายละเอียดการเลือกที่นั่ง" 
        className="seat-details-card" // ใช้คลาสที่สร้างขึ้น
    >
        {seatDetails.map((seat, index) => (
            <div key={index} className='seat-details-card'>
                <p style={{ color:'white'}}>
                    หมายเลขที่นั่ง: {seat.SeatNumber}, 
                    ประเภทที่นั่ง: {seat.SeatTypeName}, 
                    ราคา: {seat.SeatTypePrice} บาท, 
                </p>
            </div>
        ))}
    </Card>
)}

            <Button type="primary" onClick={handleProceed} disabled={selectedSeats.length === 0} className="proceed-button">
                ไปหน้าชำระเงิน
            </Button>
        </div>
    );
};

export default SeatSelection;
