import type {
	Attribute,
	AttributeStatus,
	Characteristic,
	Currency,
	Equipment,
	ExtraInfo,
	Info,
	Item,
	Skill,
	Spec,
	Specialization,
	Spell,
} from '@prisma/client';

export type Presets = {
	preset_name: string;
	preset_id: string;
	attribute: Attribute[];
	attribute_status: AttributeStatus[];
	characteristic: Characteristic[];
	currency: Currency[];
	equipment: Equipment[];
	extraInfo: ExtraInfo[];
	info: Info[];
	item: Item[];
	skill: Skill[];
	spec: Spec[];
	specialization: Specialization[];
	spell: Spell[];
}[];
