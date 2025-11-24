import { Test, TestingModule } from '@nestjs/testing';
import { StepFilesController } from './step-files.controller';

describe('StepFilesController', () => {
  let controller: StepFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StepFilesController],
    }).compile();

    controller = module.get<StepFilesController>(StepFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
