import { Logger } from '@nestjs/common';
import { InterfaceCommon } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

export class UtilBuilder<T extends ABaseEntity> {
  private readonly logger = new Logger(UtilBuilder.name);
  private repository: Repository<T>;
  private alias: string;
  private queryBuilder: SelectQueryBuilder<T>;

  constructor(repository: Repository<T>, exclude?: { excludeJoin?: (keyof T)[]; exclude?: (keyof T)[] }) {
    this.repository = repository;
    this.alias = repository.metadata.tableName;
    this.queryBuilder = this.repository.createQueryBuilder(this.alias);

    // join relations and exclude join
    const relations = this.repository.metadata.relations;
    // const columns = this.repository.metadata.columns;
    for (const relation of relations) {
      //
      const isExcludeJoin = exclude?.excludeJoin?.includes(relation.propertyName as keyof T);

      //
      if (relation.propertyName && relation.type && !isExcludeJoin) {
        try {
          this.queryBuilder.leftJoinAndSelect(`${this.alias}.${relation.propertyName}`, relation.propertyName);
        } catch (error) {
          this.logger.error(`Lỗi khi join relation ${relation.propertyName}`, error);
        }
      }
    }

    // exclude
    // const excludeColumns = ([columns, ...relations] as any)
    //   .map((column) => {
    //     const col = column.propertyName;
    //     if (!exclude?.exclude?.includes(col as keyof T) && col) return `${this.alias}.${col}`;
    //   })
    //   .filter(Boolean);
    // console.log('excludeColumns:::', excludeColumns);
    // this.queryBuilder.select(excludeColumns);
  }

  async handleConditionQueries({
    user,
    queries,
    searchField,
  }: {
    user: UserEntity;
    searchField: keyof T;
    queries: InterfaceCommon.IQueries<T>;
  }): Promise<{
    items: T[];
    totalItems: number;
  }> {
    //
    const { limit = 20, page = 1, search, fromDate, toDate, filters, sortBy, sortOrder } = queries;
    const limitNum = Number(limit) || 20;
    const pageNum = Number(page) || 1;
    const skip = Number(limitNum * pageNum - limitNum);

    // Creator (user null là public)
    if (user && !user.isAdmin && !user.isSubAdmin) {
      this.queryBuilder.where('createdBy.id = :createdById', {
        createdById: user.id,
      });
    }

    // Search
    if (searchField && search) {
      this.queryBuilder.andWhere(`${this.alias}.${searchField as string} LIKE :searchValue`, {
        searchValue: `%${search}%`,
      });
    }

    // Date range
    if (fromDate) {
      this.queryBuilder.andWhere(`${this.alias}.created_at >= :fromDate`, {
        fromDate,
      });
    }

    if (toDate) {
      this.queryBuilder.andWhere(`${this.alias}.created_at <= :toDate`, {
        toDate,
      });
    }

    // Multi-field filters
    if (filters) {
      const parsedFilters = JSON.parse(filters as string);
      this.logger.log(`Parsed filters: ${JSON.stringify(parsedFilters)}`);

      for (const [key, value] of Object.entries(parsedFilters)) {
        this.logger.log(`Processing filter: ${key} = ${JSON.stringify(value)}`);

        // Kiểm tra nếu đây là mối quan hệ ManyToMany
        const relation = this.repository.metadata.relations.find(
          (relation) => relation.propertyName === key && relation.isManyToMany,
        );

        if (relation && value !== undefined && value !== '') {
          try {
            // Lấy thông tin bảng trung gian
            const junctionTableName = relation.joinTableName; // Tên bảng trung gian, ví dụ: image_storage_keyword
            const junctionColumn = relation.junctionEntityMetadata.ownColumns.find(
              (col) =>
                col.referencedColumn && col.referencedColumn.entityMetadata.target === this.repository.metadata.target,
            )?.databaseName; // Cột liên kết với entity chính, ví dụ: image_storage_id
            const inverseColumn = relation.junctionEntityMetadata.ownColumns.find(
              (col) =>
                col.referencedColumn &&
                col.referencedColumn.entityMetadata.target === relation.inverseEntityMetadata.target,
            )?.databaseName; // Cột liên kết với entity đích, ví dụ: keyword_id

            if (!junctionTableName || !junctionColumn || !inverseColumn) {
              this.logger.error(`Không tìm thấy thông tin bảng trung gian cho quan hệ ${key}`);
              continue;
            }

            // Tạo subquery để lấy id của entity chính từ bảng trung gian
            const subQueryAlias = `${key}_junction`;
            const subQuery = this.repository.manager
              .createQueryBuilder()
              .select(`${subQueryAlias}.${junctionColumn}`)
              .from(junctionTableName, subQueryAlias);

            if (Array.isArray(value)) {
              subQuery.where(`${subQueryAlias}.${inverseColumn} IN (:...${key})`, { [key]: value });
            } else {
              subQuery.where(`${subQueryAlias}.${inverseColumn} = :${key}`, { [key]: value });
            }

            this.queryBuilder.andWhere(`${this.alias}.id IN (${subQuery.getQuery()})`, subQuery.getParameters());
          } catch (error) {
            this.logger.error(`Lỗi khi xử lý filter ManyToMany cho ${key}`, error);
          }
        } else if (value !== undefined && value !== '') {
          // Điều kiện đối với các trường khác trong entity
          this.queryBuilder.andWhere(`${this.alias}.${key} = :${key}`, { [key]: value });
        }
      }
    }

    // Sorting
    if (sortBy) {
      this.queryBuilder.orderBy(`${this.alias}.${String(sortBy)}`, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    }

    const items = await this.queryBuilder.skip(skip).take(limitNum).getMany();

    const totalItems = await this.queryBuilder.getCount();
    return { items: items, totalItems };
  }
}

//
// const items = await this.userRepository.find({
//   skip,
//   take: +limit,
//   where: { ...conditionWhere },
//   relations: {
//     createdBy: true,
//     updatedBy: true,
//     roles: true,
//     roleGroups: true,
//   },
// });
// const totalItems = await this.userRepository.count();

// Option 1: Standard LIKE (case-sensitive)
// queryBuilder.where(
//   '(user.fullName LIKE :q OR user.email LIKE :q)',
//   { q: `%${sanitizedQ}%` }
// );

// Option 2: Case-insensitive search
// queryBuilder.where(
//   '(LOWER(user.fullName) LIKE LOWER(:q) OR LOWER(user.email) LIKE LOWER(:q))',
//   { q: `%${sanitizedQ}%` }
// );

// Option 3: Full-text search (requires FULLTEXT index)
// queryBuilder.where(
//   'MATCH(user.fullName, user.email) AGAINST(:q IN NATURAL LANGUAGE MODE)',
//   { q: sanitizedQ }
// );

// Option 4: Boolean full-text search (for more complex queries)
// queryBuilder.where(
//   'MATCH(user.fullName, user.email) AGAINST(:q IN BOOLEAN MODE)',
//   { q: `+${sanitizedQ}*` }
// );
