import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntitiy } from 'src/auth/entities/user.entities';
import { In, IsNull, Repository } from 'typeorm';
import { UserIdRabbitMq } from './request/UserRabbitmq';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UserRole } from 'src/auth/entities/user.role.entities';
import { AddUserToRole } from './request/add.user.role';
import { Role } from 'src/auth/entities/role.entities';
import { UserEmployeeRequest } from './request/UserEmployee';
import { Profile } from 'src/auth/entities/user.profile.entities';
import { UserAddPermission } from './request/UserAddPermission';
import { UserPermission } from 'src/auth/entities/user.permission';
import { Permission } from 'src/auth/entities/permission.entities';
import { EditPermissionToUser } from './request/EditUserPermission';
import { CustomException } from 'src/utils/custom.exception';
import * as bcrypt from 'bcrypt';
import { ChangePassword } from './request/changepassword';
import { Request } from 'express';
import { CardInfo } from 'src/auth/entities/user.card.info.entities';
import { ReplyErrorCallback } from 'src/utils/reply.error.handle';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntitiy)
    private readonly users: Repository<UserEntitiy>,
    private readonly amqpConnection: AmqpConnection,
    private readonly elasticsearchService: ElasticsearchService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(CardInfo)
    private readonly cardInfoRepository: Repository<CardInfo>,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
  ) {}

  async findOne(
    userName: string,
    relations?: Array<string>,
  ): Promise<UserEntitiy | null> {
    return relations
      ? await this.users.findOne({
          where: { userName: userName, deletedAt: IsNull(), actived: true },
          relations: relations,
        })
      : await this.users.findOneBy({
          userName: userName,
        });
  }

  async findOneById(
    id: number,
    relations?: Array<string>,
  ): Promise<UserEntitiy | null> {
    if (!id) {
      return null;
    }
    return relations
      ? await this.users.findOne({
          where: { id: id },
          relations: relations,
        })
      : await this.users.findOneBy({
          id: id,
        });
  }

  async addUserToRole(addUserToRole: AddUserToRole) {
    const user = await this.users.findOneBy({ id: addUserToRole.userId });
    const role = await this.roleRepository.findOneBy({
      id: addUserToRole.roleId,
    });
    const userRole = new UserRole();
    userRole.role = role;
    userRole.user = user;
    await this.userRoleRepository.save(userRole);
    return 'Thêm quyền cho user thành công';
  }

  async editUserToRole(addUserToRole: AddUserToRole) {
    const user = await this.users.findOneBy({ id: addUserToRole.userId });
    const userRole = await this.userRoleRepository.findOneBy({
      user: user,
    });
    const role = await this.roleRepository.findOneBy({
      id: addUserToRole.roleId,
    });
    userRole.role = role;
    await this.userRoleRepository.save(userRole);
    return 'update quyền cho user thành công';
  }

  async addPermissionToUser(addUserToPermission: UserAddPermission) {
    const user = await this.users.findOneBy({ id: addUserToPermission.userId });
    const permission = await this.permissionRepository.find({
      where: {
        id: In(addUserToPermission.permissionId),
      },
    });
    const userPermissions = [];
    permission.forEach((item) => {
      const userPermission = new UserPermission();
      userPermission.permission = item;
      userPermission.user = user;
      userPermissions.push(userPermission);
    });
    await this.permissionRepository.save(userPermissions);
    return 'Thêm quyền cho user thành công';
  }

  async editPermissionToUser(editPermissionToUser: EditPermissionToUser) {
    if (
      !editPermissionToUser.deletePermissionId &&
      !editPermissionToUser.addPermissionId
    ) {
      throw new CustomException('Lỗi dữ liệu', HttpStatus.BAD_REQUEST);
    }
    const user = await this.users.findOneBy({
      id: editPermissionToUser.userId,
    });
    const permission = await this.permissionRepository.find({
      where: {
        id: In(editPermissionToUser.addPermissionId),
      },
    });
    if (editPermissionToUser.deletePermissionId) {
    }
    const userPermissions = [];
    permission.forEach((item) => {
      const userPermission = new UserPermission();
      userPermission.permission = item;
      userPermission.user = user;
      userPermissions.push(userPermission);
    });
    await this.permissionRepository.save(userPermissions);
    return 'Thêm quyền cho user thành công';
  }

  async changePassword(request: Request, changePassword: ChangePassword) {
    const user = await this.findOneById(request.user['sub']);
    if (changePassword.newPassword != changePassword.confirmNewPassword) {
      throw new CustomException('password không đúng', HttpStatus.NOT_MODIFIED);
    }
    if (
      (await bcrypt.compare(changePassword.password, user.password)) == false
    ) {
      throw new CustomException('password không đúng', HttpStatus.NOT_MODIFIED);
    }
    user.password = bcrypt.hash(changePassword.password, 10);
    await this.users.save(user);
    return 'Đổi password thành công';
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'check_user',
    queue: 'check_user_queue',
    errorHandler: ReplyErrorCallback,
  })
  async getUserByIdRabbit(data: any) {
    if (!data.id) {
      return null;
    }
    return data.relations
      ? await this.users.findOne({
          where: { id: data.id },
          relations: data.relations,
        })
      : await this.users.findOneBy({
          id: data.id,
        });
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'get_uuid',
    queue: 'get_uuid_queue',
    errorHandler: ReplyErrorCallback,
  })
  async getUUID(userRabbitmq: UserIdRabbitMq) {
    const user = await this.users.findOneBy({ id: userRabbitmq.userId });
    return { uuid: user.uuid };
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'add_user',
    queue: 'add_user_queue',
    errorHandler: ReplyErrorCallback,
  })
  async addUser(userRabbitmq: UserEmployeeRequest) {
    try {
      const user = new UserEntitiy();
      user.userName = userRabbitmq.userName;
      user.password = userRabbitmq.password
        ? await bcrypt.hash(userRabbitmq.password, 10)
        : await bcrypt.hash('Abcd@1234', 10);
      user.avatar = userRabbitmq.avatar;
      const profile = new Profile();
      const cardInfo = new CardInfo();
      profile.address = userRabbitmq.address ?? null;
      profile.fullName = userRabbitmq.fullName;
      profile.email = userRabbitmq.email;
      profile.districtId = userRabbitmq.districtId;
      profile.wardId = userRabbitmq.wardId;
      profile.provinceId = userRabbitmq.provinceId;
      profile.dateOfBirth = userRabbitmq.birthDay;
      profile.gender = userRabbitmq.gender;
      profile.countryId = userRabbitmq.countryId;
      profile.nationId = userRabbitmq.nationId;
      profile.phoneNumber = userRabbitmq.phoneNumber;

      cardInfo.dateOfBirth = userRabbitmq.birthDay;
      cardInfo.dateOfExpiry = userRabbitmq.front.expiry_date;
      cardInfo.fullName = userRabbitmq.fullName;
      cardInfo.gender = userRabbitmq.front.gender;
      cardInfo.idNumber = userRabbitmq.front.id_number;
      cardInfo.issueBy = userRabbitmq.back.issued_by;
      cardInfo.issueDate = userRabbitmq.back.issue_date;
      cardInfo.nationality = userRabbitmq.front.nationality;
      cardInfo.personalIdentification =
        userRabbitmq.back.personal_identification;
      cardInfo.placeOfOrigin = userRabbitmq.front.place_of_origin;
      cardInfo.placeOfResident = userRabbitmq.front.place_of_residence;
      cardInfo.mediaCardFontId = userRabbitmq.mediaIdFront;
      cardInfo.mediaCardBackId = userRabbitmq.mediaIdBack;
      user.profile = profile;
      user.cardInfo = cardInfo;
      const result = await this.users.save(user);
      if (userRabbitmq.role > 0) {
        const roleEntity = await this.roleRepository.findOneBy({
          id: userRabbitmq.role,
        });
        const userRole = new UserRole();
        userRole.role = roleEntity;
        userRole.user = result;
        await this.userRoleRepository.save(userRole);
      }
      if (
        userRabbitmq.listPermission &&
        userRabbitmq.listPermission.length > 0 &&
        userRabbitmq.role === 0
      ) {
        const allPermission = userRabbitmq.listPermission.find(
          (item: any) => item.group === 'all',
        );
        if (allPermission && allPermission.actions[0].checked) {
          const permission = await this.permissionRepository.findOneBy({
            module: allPermission.group,
            action: allPermission.actions[0].action.toLowerCase(),
          });
          const userPermission = new UserPermission();
          userPermission.user = result;
          userPermission.permission = permission;
          await this.userPermissionRepository.save(userPermission);
        } else {
          const listRolePermission = [];
          for (const item of userRabbitmq.listPermission) {
            for (const i of item.actions) {
              if (i.checked) {
                const permission = await this.permissionRepository.findOneBy({
                  module: item.group,
                  action: i.action.toLowerCase(),
                });
                if (permission) {
                  const userPermission = new UserPermission();
                  userPermission.user = result;
                  userPermission.permission = permission;
                  listRolePermission.push(userPermission);
                }
              }
            }
          }
          await this.userPermissionRepository.save(listRolePermission);
        }
      }
      return { user: result, cardInfo, profile };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'delete_soft_user',
    queue: 'delete_soft_user_queue',
    errorHandler: ReplyErrorCallback,
  })
  async deleteSoftUser(user: UserIdRabbitMq) {
    const userEntitiy = await this.users.findOneBy({ id: user.userId });
    if (userEntitiy.deletedAt === null) userEntitiy.deletedAt = new Date();
    else userEntitiy.deletedAt = null;
    await this.users.save(userEntitiy);
    return 'khoá user thành công';
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'delete_user',
    queue: 'delete_user_queue',
    errorHandler: ReplyErrorCallback,
  })
  async deleteUser(user: UserIdRabbitMq) {
    await this.users.delete(user.userId);
    return 'xoá user thành công';
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'edit_user',
    queue: 'edit_user_queue',
    errorHandler: ReplyErrorCallback,
  })
  async editUser(userRabbitmq: UserEmployeeRequest) {
    //edit user;
    const user = await this.users.findOneBy({ id: userRabbitmq.id });
    if (userRabbitmq.password)
      user.password = bcrypt.hash(userRabbitmq.password, 10);
    // if (userRabbitmq.userName) user.userName = userRabbitmq.userName;
    if (userRabbitmq.avatar != user.avatar) user.avatar = userRabbitmq.avatar;
    if (userRabbitmq.address != user.profile.address)
      user.profile.address = userRabbitmq.address;
    if (userRabbitmq.email != user.profile.email)
      user.profile.email = userRabbitmq.email;
    if (userRabbitmq.districtId != user.profile.districtId)
      user.profile.districtId = userRabbitmq.districtId;
    if (userRabbitmq.wardId != user.profile.wardId)
      user.profile.wardId = userRabbitmq.wardId;
    if (userRabbitmq.provinceId != user.profile.provinceId)
      user.profile.provinceId = userRabbitmq.provinceId;
    if (userRabbitmq.birthDay != user.profile.dateOfBirth) {
      user.profile.dateOfBirth = userRabbitmq.birthDay;
      user.cardInfo.dateOfBirth = userRabbitmq.birthDay;
    }
    if (userRabbitmq.gender != user.profile.gender) {
      user.cardInfo.gender = userRabbitmq.gender == 1 ? 'Nam' : 'Nữ';
      user.profile.gender = userRabbitmq.gender;
    }
    if (userRabbitmq.phoneNumber != user.profile.phoneNumber)
      user.profile.phoneNumber = userRabbitmq.phoneNumber;

    // cardInfo.dateOfExpiry = userRabbitmq.expiry_date;
    // cardInfo.fullName = userRabbitmq.fullName;
    // cardInfo.idNumber = userRabbitmq.id_number;
    // cardInfo.issueBy = userRabbitmq.issued_by;
    // cardInfo.issueDate = userRabbitmq.issue_date;
    // cardInfo.nationality = userRabbitmq.nationality;
    // cardInfo.personalIdentification = userRabbitmq.personal_identification;
    // cardInfo.placeOfOrigin = userRabbitmq.place_of_origin;
    // cardInfo.placeOfResident = userRabbitmq.place_of_residence;
    // cardInfo.mediaCardFontId = userRabbitmq.mediaIdFront;
    // cardInfo.mediaCardBackId = userRabbitmq.mediaIdBack;
    await this.users.update(userRabbitmq.id, user);
    const useRole = await this.userRoleRepository.findBy({
      user: user,
    });
    if (
      useRole.length > 0 &&
      !useRole.map((item) => item.role.id).includes(userRabbitmq.role)
    ) {
      await this.userRoleRepository.delete(useRole.map((item) => item.id));
    }
    //edit role
    if (userRabbitmq.role && userRabbitmq.role > 0) {
      const roleEntity = await this.roleRepository.findOneBy({
        id: userRabbitmq.role,
      });

      const userRoleEntity = new UserRole();
      userRoleEntity.user = user;
      userRoleEntity.role = roleEntity;
      await this.userRoleRepository.save(userRoleEntity);
    }

    // update permission
    if (
      userRabbitmq.listPermission &&
      userRabbitmq.listPermission.length > 0 &&
      userRabbitmq.role === 0
    ) {
      const userPermission = await this.userPermissionRepository.findBy({
        user: user,
      });
      const allPermission = userRabbitmq.listPermission.find(
        (item: any) => item.group === 'all',
      );
      // add permission
      if (allPermission && allPermission.actions[0].checked) {
        const permission = await this.permissionRepository.findOneBy({
          module: allPermission.group,
          action: allPermission.actions[0].action.toLowerCase(),
        });
        const userPermission = new UserPermission();
        userPermission.user = user;
        userPermission.permission = permission;
        await this.userPermissionRepository.save(userPermission);
      } else {
        const duplicatePermission = userPermission
          .filter((i) => {
            const matchingModule = userRabbitmq.listPermission.find(
              (item: any) => item.module === i.permission.module,
            );
            return matchingModule?.actions.some(
              (a: any) =>
                a.action === i.permission.action && a.checked === true,
            );
          })
          .map((item) => item.id);
        if (duplicatePermission.length > 0) {
          await this.userPermissionRepository
            .createQueryBuilder()
            .delete()
            .where('id NOT IN (:...duplicatePermission)', {
              duplicatePermission,
            }) // `:...ids` là cách truyền danh sách giá trị
            .execute();
        }
        const listRolePermission = [];
        for (const item of userRabbitmq.listPermission) {
          for (const i of item.actions) {
            if (i.checked) {
              const permission = await this.permissionRepository.findOneBy({
                module: item.group,
                action: i.action.toLowerCase(),
              });
              if (permission && !duplicatePermission.includes(permission.id)) {
                const userPermission = new UserPermission();
                userPermission.user = user;
                userPermission.permission = permission;
                listRolePermission.push(userPermission);
              }
            }
          }
        }
        await this.userPermissionRepository.save(listRolePermission);
      }
    }
    return { user: user, cardInfo: user.cardInfo, profile: user.profile };
  }

  @RabbitRPC({
    exchange: 'auth',
    routingKey: 'get_user',
    queue: 'get_user_queue',
    errorHandler: ReplyErrorCallback,
  })
  async getUserById(user: UserIdRabbitMq) {
    return await this.users.findOne({
      where: { id: user.userId },
      relations: ['profile', 'cardInfo'],
    });
  }
}
