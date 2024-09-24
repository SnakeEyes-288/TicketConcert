import React, { useState, useEffect } from 'react';  
import { Button, Typography, Card, Spin, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { GetSeatsByConsertId, GetSeatType } from '../../services/https';

const { Title } = Typography;

const SeatSelection: React.FC = () => {
    const [seatsData, setSeatsData] = useState<any[]>([]);
    const [groupedSeats, setGroupedSeats] = useState<any>({});
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [selectedSeatType, setSelectedSeatType] = useState<number | null>(null);
    const [selectedZone, setSelectedZone] = useState<string | null>(null); // NEW: Track selected zone
    const [selectedConcert, setSelectedConcert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                        
                        // จัดกลุ่มที่นั่งตามประเภทที่นั่ง (SeatTypeID) หรือโซน
                        const grouped = seatsWithDetails.reduce((acc: any, seat: any) => {
                            const zone = seat.SeatTypeName || 'อื่นๆ'; // ใช้ชื่อโซนหรือตั้งชื่อเองตามต้องการ
                            if (!acc[zone]) {
                                acc[zone] = [];
                            }
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

    // Function to select a zone
    const handleZoneClick = (zone: string) => {
        setSelectedZone(zone);
    };

    const handleSeatClick = (seatNumber: string, seatTypeId: number, isAvailable: boolean) => {
        if (!isAvailable) {
            alert('ที่นั่งนี้ถูกจองไปแล้ว');
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
            
            if (updatedSeats.length === 0) {
                setSelectedSeatType(null);
            } else {
                setSelectedSeatType(seatTypeId);
            }
            
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
                selectedSeats,
                selectedConcert: selectedConcert?.name,
                selectedSeatType: selectedSeatTypeName,
                ticketQuantity,
                ticketPrice,
            },
        });
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <Title level={3}>เลือกโซนสำหรับ {selectedConcert?.name}</Title>
            {error && <Alert message={error} type="error" showIcon />}
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', justifyItems: 'center', marginBottom: '30px' }}>
                    {/* Render the Zones */}
                    {Object.keys(groupedSeats).map(zone => (
                        <Button
                            key={zone}
                            onClick={() => handleZoneClick(zone)}
                            style={{ width: '150px', height: '50px', fontSize: '18px', backgroundColor: selectedZone === zone ? '#1890ff' : '#ff4d4f', color: 'white' }}
                        >
                            {zone}
                        </Button>
                    ))}
                </div>
            )}

            {selectedZone && (
                <div>
                    <Title level={4}>เลือกที่นั่งใน {selectedZone}</Title>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '10px',
                        justifyItems: 'center',
                        marginTop: '20px'
                    }}>
                        {groupedSeats[selectedZone].map((seat: any) => (
                            <Card
                                key={seat.SeatNumber}
                                style={{
                                    backgroundColor: selectedSeats.includes(seat.SeatNumber) ? '#ffe58f' : seat.IsAvailable ? '#f0f0f0' : '#ff4d4f',
                                    border: selectedSeats.includes(seat.SeatNumber) ? '2px solid #faad14' : '1px solid #d9d9d9',
                                    cursor: seat.IsAvailable ? 'pointer' : 'not-allowed',
                                    width: '80px',
                                    textAlign: 'center',
                                    padding: '5px'
                                }}
                                onClick={() => handleSeatClick(seat.SeatNumber, seat.SeatTypeID, seat.IsAvailable)}
                            >
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{seat.SeatNumber}</p>
                                <p style={{ margin: 0 }}>{seat.SeatTypePrice} บาท</p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <Button type="primary" onClick={handleProceed} disabled={selectedSeats.length === 0} style={{ marginTop: '20px' }}>
                ไปหน้าชำระเงิน
            </Button>
        </div>
    );
};

export default SeatSelection;
