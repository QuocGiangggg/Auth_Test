import { ApiProperty } from "@nestjs/swagger";
export class Partner{
    @ApiProperty({
        description: 'Partner ID',
        type: Number,
    })
    partnerId: number;
}