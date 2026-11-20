import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientContact } from '../../entities/client-contact.entity';
import { ClientContactDto } from './dto/client-contact.dto';

function normalizeClientName(name: string) {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function normalizeWhatsappPhone(phone?: string) {
  if (!phone?.trim()) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Accept a Bangladeshi local mobile number and store its international form.
  if (digits.length === 11 && digits.startsWith('01')) digits = `880${digits.slice(1)}`;
  if (digits.length < 7 || digits.length > 15) {
    throw new BadRequestException('Enter a valid phone number with its country code.');
  }
  return digits;
}

function toEntityValues(dto: ClientContactDto) {
  const clientName = dto.clientName.trim().replace(/\s+/g, ' ');
  return {
    clientName,
    normalizedName: normalizeClientName(clientName),
    whatsappPhone: normalizeWhatsappPhone(dto.whatsappPhone),
    messengerUrl: dto.messengerUrl?.trim() || null,
  };
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientContact)
    private readonly clientContactRepository: Repository<ClientContact>,
  ) {}

  findAll() {
    return this.clientContactRepository.find({ order: { clientName: 'ASC' } });
  }

  async create(dto: ClientContactDto) {
    const values = toEntityValues(dto);
    const existing = await this.clientContactRepository.findOne({ where: { normalizedName: values.normalizedName } });
    if (existing) throw new ConflictException('Contact details already exist for this client.');
    return this.clientContactRepository.save(this.clientContactRepository.create(values));
  }

  async update(id: string, dto: ClientContactDto) {
    const existing = await this.clientContactRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Client contact not found.');
    const values = toEntityValues(dto);
    const duplicate = await this.clientContactRepository.findOne({ where: { normalizedName: values.normalizedName } });
    if (duplicate && duplicate.id !== id) throw new ConflictException('Contact details already exist for this client.');
    Object.assign(existing, values);
    return this.clientContactRepository.save(existing);
  }
}
