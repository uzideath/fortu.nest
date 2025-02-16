import { IsInt, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateGroupDto {
    @IsString()
    name: string;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) { }


export class AddGroupMemberDto {
    @IsInt()
    userId: number;

    @IsInt()
    groupId: number;
}