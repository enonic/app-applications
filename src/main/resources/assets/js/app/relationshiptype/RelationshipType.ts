import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {Schema, SchemaBuilder} from '@enonic/lib-admin-ui/schema/Schema';
import {RelationshipTypeJson} from './RelationshipTypeJson';
import {RelationshipTypeName} from './RelationshipTypeName';

export class RelationshipType
    extends Schema
    implements Equitable {

    private fromSemantic: string;

    private toSemantic: string;

    private allowedFromTypes: string[];

    private allowedToTypes: string[];

    constructor(builder: RelationshipTypeBuilder) {
        super(builder);
        this.fromSemantic = builder.fromSemantic;
        this.toSemantic = builder.toSemantic;
        this.allowedFromTypes = builder.allowedFromTypes;
        this.allowedToTypes = builder.allowedToTypes;
    }

    getRelationshiptypeName(): RelationshipTypeName {
        return new RelationshipTypeName(this.getName());
    }

    getFromSemantic(): string {
        return this.fromSemantic;
    }

    getToSemantic(): string {
        return this.toSemantic;
    }

    getAllowedFromTypes(): string[] {
        return this.allowedFromTypes;
    }

    getAllowedToTypes(): string[] {
        return this.allowedToTypes;
    }

    equals(o: Equitable): boolean {

        if (!ObjectHelper.iFrameSafeInstanceOf(o, RelationshipType)) {
            return false;
        }

        if (!super.equals(o)) {
            return false;
        }

        const other: RelationshipType = o as RelationshipType;

        if (!ObjectHelper.stringEquals(this.fromSemantic, other.fromSemantic)) {
            return false;
        }

        if (!ObjectHelper.stringEquals(this.toSemantic, other.toSemantic)) {
            return false;
        }

        if (!ObjectHelper.stringArrayEquals(this.allowedFromTypes, other.allowedFromTypes)) {
            return false;
        }

        if (!ObjectHelper.stringArrayEquals(this.allowedToTypes, other.allowedToTypes)) {
            return false;
        }

        return true;
    }

    static fromJson(json: RelationshipTypeJson): RelationshipType {
        return new RelationshipTypeBuilder().fromRelationshipTypeJson(json).build();
    }
}

export class RelationshipTypeBuilder
    extends SchemaBuilder {

    fromSemantic: string;

    toSemantic: string;

    allowedFromTypes: string[];

    allowedToTypes: string[];

    constructor(source?: RelationshipType) {
        super(source);
        if (source) {
            this.fromSemantic = source.getFromSemantic();
            this.toSemantic = source.getToSemantic();
            this.allowedFromTypes = source.getAllowedFromTypes();
            this.allowedToTypes = source.getAllowedToTypes();
        }
    }

    fromRelationshipTypeJson(relationshipTypeJson: RelationshipTypeJson): RelationshipTypeBuilder {

        super.fromSchemaJson(relationshipTypeJson);

        this.fromSemantic = relationshipTypeJson.fromSemantic;
        this.toSemantic = relationshipTypeJson.toSemantic;
        this.allowedFromTypes = relationshipTypeJson.allowedFromTypes;
        this.allowedToTypes = relationshipTypeJson.allowedToTypes;
        return this;
    }

    build(): RelationshipType {
        return new RelationshipType(this);
    }
}
