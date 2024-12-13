import { ApiProperty } from "@nestjs/swagger";

export class UserInfo {
	@ApiProperty({
		description: '用户账号'
	})
	name: string

	@ApiProperty({
		description: '用户名'
	})
	nickName: string

	@ApiProperty({
		description: '邮箱'
	})
	email: string

	@ApiProperty({
		description: '手机号码'
	})
	phone: string

	@ApiProperty({
		description:'备注'
	})
	remark: string

	@ApiProperty({
		description: '头像'
	})
	headImg: string

	@ApiProperty({
		description: '登录IP'
	})
	loginIP: string
}
