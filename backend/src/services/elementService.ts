import prisma from '../database';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';

export const createElement = (
  campaign_id: number,
  type: string,
  position: { x: number, y: number },
  data?: any,
  parent_element_id?: string
) => {
  return prisma.mapElement.create({
    data: {
      id: nanoid(),
      campaignId: campaign_id,
      type: type,
      positionX: position.x,
      positionY: position.y,
      data: data ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
      parentElementId: parent_element_id,
    },
  });
};

export const updateElement = (elementId: string, data: any, width?: number, height?: number) => {
  return prisma.mapElement.update({
    where: { id: elementId },
    data: {
      data: data ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
      width,
      height,
    },
  });
};

export const deleteElement = (elementId: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.mapLink.deleteMany({
      where: {
        OR: [
          { sourceElementId: elementId },
          { targetElementId: elementId },
        ],
      },
    });
    await tx.mapElement.delete({ where: { id: elementId } });
  });
}; 