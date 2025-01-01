import { mockUser } from '../mockData';
import { delay } from '../utils';

export async function mockUpdateInsurance(insuranceData: {
  providerName: string;
  policyNumber: string;
  planType: string;
}) {
  await delay(500);
  
  if (mockUser.insuranceInfo) {
    mockUser.insuranceInfo = {
      ...mockUser.insuranceInfo,
      ...insuranceData
    };
  } else {
    mockUser.insuranceInfo = insuranceData;
  }

  return { 
    data: { 
      insuranceInfo: mockUser.insuranceInfo 
    } 
  };
}