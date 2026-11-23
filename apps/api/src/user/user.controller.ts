import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { BetterAuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/user.dto';

@UseGuards(BetterAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    getMe(@Req() req: any) {
        return this.userService.getMe(req.user.id);
    }

    @Patch('profile')
    updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
        return this.userService.updateProfile(req.user.id, dto);
    }

    @Get('activity')
    getActivity(@Req() req: any) {
        return this.userService.getActivity(req.user.id);
    }
}