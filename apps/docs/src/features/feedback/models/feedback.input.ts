import { IsEmail, IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

/**
 * DTO for submitting user feedback
 */
export class SubmitFeedbackInput {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsUrl()
    @IsNotEmpty()
    url!: string;

    @IsIn(['good', 'bad'])
    @IsNotEmpty()
    opinion!: 'good' | 'bad';

    @IsString()
    @IsNotEmpty()
    message!: string;
}
