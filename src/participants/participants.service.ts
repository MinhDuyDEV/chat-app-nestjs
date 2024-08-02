import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Participant } from 'src/utils/typeorm';
import { IParticipantsService } from './participants';
import {
  CreateParticipantParams,
  FindParticipantParams,
} from 'src/utils/types';

@Injectable()
export class ParticipantsService implements IParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  findParticipant(params: FindParticipantParams): Promise<Participant | null> {
    return this.participantRepository.findOne({
      where: { ...params },
    });
  }

  createParticipant(params: CreateParticipantParams): Promise<Participant> {
    const participant = this.participantRepository.create(params);
    return this.participantRepository.save(participant);
  }
}
