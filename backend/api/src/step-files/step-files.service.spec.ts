import { Test, TestingModule } from '@nestjs/testing';
import { StepFilesService } from './step-files.service';

describe('StepFilesService', () => {
  let service: StepFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StepFilesService],
    }).compile();

    service = module.get<StepFilesService>(StepFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
