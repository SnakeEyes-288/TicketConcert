export interface PaymentInterface {
    ID?: number;              
    PaymentMethod?: string;   
    PaymentDate?: string;     
    Status?: string;   
    Quantity?: number;
    Amount?: number;
    SlipImage?:string;
}
