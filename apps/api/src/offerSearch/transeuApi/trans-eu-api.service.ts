import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class TransEuApiService {
    private readonly logger = new Logger(TransEuApiService.name);
    private accessToken: string | null = null;
    private readonly MIN_DISTANCE = 200000;
    private readonly MAX_DISTANCE = 3000000;

    private getBearerToken(): string {

        //return "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzpkZjg0MjM1ZS00NTdiLTQ1YjgtODFiYi0xZDYyYmFmOTJlZWYiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOltdLCJjbGllbnRfaWQiOiJ0cmFucy1sb2dpbiIsImV4cCI6MTc0ODM1MDc2OCwiZXh0Ijp7InVzZXJfaW5mbyI6eyJhY2NvdW50X2lkIjoxOTE2MzcwLCJhZGRvbnNfbWV0YWRhdGEiOnsiZXhjaGFuZ2UiOnsicmVnaW9ucyI6W119LCJyb3V0ZV9jYWxjdWxhdG9yIjp7InJlZ2lvbnMiOltdfX0sImNvbXBhbnkiOnsiaWQiOjEyNTAyMjksImlzX2F1dGhvcml6ZWQiOnRydWUsInJvbGVzIjpbImNhcnJpZXIiXX0sImNvbXBhbnlfaWQiOjEyNTAyMjksImVtYWlsIjoiYW1pc2lhazdAZ21haWwuY29tIiwicGVybWlzc2lvbnMiOnsiaXNfYmxvY2tlZCI6ZmFsc2UsImlzX2RyaXZlciI6ZmFsc2UsImlzX2VudGl0bGVkIjp0cnVlLCJpc19oaWRkZW4iOmZhbHNlLCJpc19tb2RlcmF0b3IiOmZhbHNlfSwidHJhbnNfaWQiOiIxMjUwMjI5LTEifX0sImlhdCI6MTc0ODMyOTE2NywiaXNzIjoiaHR0cHM6Ly9hdXRoLnBsYXRmb3JtLnRyYW5zLmV1LyIsImp0aSI6IjYwYjNmOGEzLTJkNDktNDY4ZC05ZDk5LTc5ZTFkOGRkYzQ5YSIsIm5iZiI6MTc0ODMyOTE2Nywic2NwIjpbIm9mZmxpbmUiLCJvcGVuaWQiLCJlTnFsWEd1UzR5Z1N2c3BlQU1mczlrUnZ6SEV3cEdXbUVHZ0F1YnIyOUJzODlZQkV1UHBIZDhueWx3a2trT1FMTzBPVnZWSERudUlGeElKL3VzMWdMWjNBM2d4UWZsc3RtSCs1RnM3T2x4Q2hIQmlwMmVxMHVRVG5kb2xRVmt4UFYrR1puaGVxQkZoQ0Y3SDdCUE1pOVJjMGVveFJTSmlvSkE5dDV0dE1GWjFnaENoOFM0eXdIOFB0V0RBdndTNDdWZ1pBRmpDenNGWm9OVTVqd0M1YVdYRVhVamdCOXZacGhJTUUvN29nZm1nRFlsSkVVald0elZuSEtPbUxPbW91NWNkaG9jYk5vTndWNjkyazlJSFZnUHR3Njh6SzNHb3VnZHNFRSt1b1crMDFhMngrN1ZNc2ZzekV3RDhyV0ZlV1F2ME5Lc0V2WXNFNW9hWjlxd2FZbm1kUW5EcWhGV0YrcW8yZ2FjN0hlSlJYQTBUVUdBRm1hNmN0ajJZekZTM2FITmRzalN0a1A5Qi9WbUdBNzc3RTJtNlJiKzlxOGVySEEweWN3SWRmL1U5SDRxdXFoUjN5R3ZHQ3AyQVNNRjVLTy9FUUxNeWJ2VDFCTHJWQWpwampwM29jeCsvTGVycmdXbWFxWnVnTTVVRDhmbFYrQlBtQldERXZFcW9SbmVCS08yaHhmVWdBWjIrVXo4SXYySmtrUVExaHVhQ1QwdFlKMW9MYmRackErbkh0SHRzN1NqbktYSGtnVWxnM2dMTkV6SXMycmhhcUF3a3pEZjNpRUpWQVlrZWx6Tnp1NG5FVDZxRmJvbE0ySENYYjB4bnpvTXhwSTlRVU9tUENwOGJzYmpDaFhqcDBwSU5oVWpUMzBvYlFob2NWN1J4bHo3aUZPdndTK3A4VlZ1Q1hYRWQ2UDlveXZFQTE1a1dvRDJxdHZuRzRlM2tSK01XZVZFM1FSKzRhYmF5S0E5SkFlMEZrVU5GQmxUUXlncTd1Q2NyNUhkbnBsb0dIQWZza1RuK0F1dWo5L0lVMjVyKzNXU2YxdWNTUmtZVS8rdHpRYnhmNkZhYXR5eUtEVUlEVTB3UUc3eXN5OFZuakU3WE9kekJrQWdXR09tMXU4WVY5aDhSNU80ZTI5Um5UeXZvZVNEMkpwcGtXdjZhTTZWVzVIb2NFSVF1MTlsTWIzbEtJYkNaMnZWdG14QjNNWnB2WEcrTUlUSThMcGhDanJmTXdkQWF5R00xWHIvVEtRMU5kWVdoaXRJUjNhZkJkMHFUTFppZjVUcVA2VTVIZllsQ0lQVTFEbUlhNms1b21KaXllTS9jQ0xGWk9nRldUMmNZUnU4NHpOV0tZOFViZ0hRdWhlY05RbmUyMnFPcVJaZTBablIvSzRuS1NtdkxqbXpQYk5sMjJrSVpJejdZWjNybXo1VldKMDJvbXFDUUszS2MyL3FEZDI5Q05zekEzSE0rc1pNZGU0cnhsdnd6ZzBwL0dYai9pMHNmV1hqOENlOHFxcUdTbTFVTk1xd2xqdmkzRyt5S2hvNXU1Z21BTlRKdVlMdEYzUXhWN1FnVkgzTWpjNWFPM21pYlNyelBjZ0w5MTdNaUU4SjdmQjdscjN0b3pDVE9CSmt5dTFuazdKclk0Z2l5Tm44R0xGdjVmKzR0TTN0VTdVYUMzOENFOUQ4QnhyKzRrTHJJZkIrcFVNVERKYXdCN08zeDRrNklUeXpqVGJLNWpuMXJxYVhPby9ZZUdlWDcwVGFJVjM5eEtXamxRbkFTcnd0N1NIOVJwZFBUZWRhSDJzUEJmSDdLRlUveEgwbC93VFpMT0pnamNkbkx5dkNzQkZDVzZkMXZIWWtjd1V5SHJaYjdhWjJrVWpTWGVoWlJCaE9XaE90TDA2b0RvdTJjRlpsUGFaRlFmaHorRWNpNzhLcUtTTU4wUHQzQWpYb0h3VTVIenUyOVJFY3JOQUdYK2k4WTMraTFjRS9ydE5Xa2o0SHR0U01GQXNiWjl3R1pESHBSUkR1SDVBcEk0WDU1b2FlcDJqdUI0bUZidzl3UEgxMFFibEdrcGdhV1RjWXhFdEN6N1Q3Z1R2MWQ2MnFSc2poZ1FRZmRLK0Q4NGIyNVZDcVM5cGIrRWcvTWhaUVg0RG9SZlVUZWlobGdyc0hYVUVJVlh4MEk5YnVlamYwSTVHaXFMeHFLTVhsbDZyQWR6TkswcWxaUk5sWWs2K0tSZitjWFJFRzBzc2FScGlHVXg1cEJNUExTQjdWeExyc0MrTDh6TVc3ZzB4NWRmWU1wUUR6MW9vdU5EOHp4RXpzRnE2TUhqTkx1QWJTOU91UmYrT2RyWVcvcGlwaE1RRGhJYzlBeDMvNDV3NmhweFpVNXZmbUpld3NYeGl4Z0RiT0h1cXhVS2JJZzRjK3hVQ0M1UkdQQmlnSXM0NXlUckhRNHpWUnd4czRvbjMzSHBUMGdrTnREbTEvUC9UeFFHcGxYR3hZSk9kVFR1MjZMYUxmamdJbDdGZExkcExhOU9kajBXTTU2TVhwY3JkTTMrUUhkVU1saExUT3NGaXE5U2tjM1VmSUFqUGhVNXhlRE9ZalFEMjVyRkdwdENOUzNMTVlhcXR5RVUrNXErcUpEMG1KMTZSd1RIZlhPeXhUamR3aEVqRzZTbzVvVitlZWJvR1hMY3dYZHFCYnVsd1A5SXB0UFJ0MDdwa3BRYnA3bEViZ2Z1bG5SRXBKZ0NjQ1hHQ3JhVmJzNDZQRDhCSitFWTYyUXVHc3VCQzd0UUYzemlabWNtMEV4ek1EZXBNZTNhakVwUnpyMEsrKzJJR0JMVThpc3Q2T2RSTmR6NXVoSk94K2FKQWV0NDJvQkpIOHVKZ1hBdXdzWU5rSlFnMnVhd2VvSG1semFJdDRmZmlhanVGbWlZcmN2dHVZRGlRazM0TnQybnZCYnRrRFYxMVJubUZXQjd0ZXlWVXhaN1V4OTdrZml1Z3BxOGZjbW9aUDVzZ2lpcnV1Tk9tNTN3RDU4NmxtK1NTOVF2WjU2LzVtVWhZczV1WmpDNzRKY2oyajNCOUNKczBaSU5mN0NVYmpoeHdkenkzMW85bUVYN001UnNVbXE4SXpQRTdFUFRzVzZ4S0VHUXhyY05KaWZyL0RwYTZneW9ScERMUFg2UldkK0ZCQktzbDdqNTcxS3pEK0NFTGd1NjZLUDdRRGszN1VWMWtucVlJYWV6N2RVcUMraUpwU3VNVHFEa0FkU2ZOeTBqSzJ2Z2NJb2NQbFE1cW1XaFd5Z0NPTm1uWmxHdkRJbDNqYTJvZVY2VjE3Nm5jZThqcXpYWllzU3JzWElPVmtqdW0zMVN2eFYzYjlwNThUek1oazNZcmpqcWtmU05uTEd0MVZvQTArT3huTUlNMjZCTFZ1SlVFZUdvZytGQkc0Z0d1TjNQL2NWd3Vud1FXMWRacHBVQzVtNHhBNHhzdmd5aTFnTHVtV1JVcVcrNHdIRkI1V1dMcTNzMk1NZXFQcUkwaDc4dEhnaHM3WXdTUHVUQWhNVXRvbjNFWTIrZEJPTzFaNjdFeU9pc2xXaFVXSnpCTVF4R0hMVWY5dFl0VHVpTzViRDE4YURnQlMxYTM5S2pIbzJyZHl4ZVg1ZEg4SXhVVFJrVXRWeHRweURuVE9DOUwwSXRlUWdsN0xPcHFWdGtKVG95QkwrMk9QYys4aWMxcW1tR05RT1d1WEFWTlR4Q2NZc0pCalg0aUFYNi9qS0ljUkc0S0tWQWRESUF1M3FMbzVvcE1BNTM0Y2loZ2d0QkZoMjZ5M0FqMFBMUTV4aUxMN3dsYWRrVFpucUZMM0dPUGl5SHJ2WUxFSUcrcUV2RGFlSXFiUkVMdnRDTXl3NjVQUkkwczlRaldyUVZXQTRNcDBwVzlSc2s3M1VySEgweHJVTHlXZHdJcG5oclVFMitBalNhNVhFWGhvY3FnT3BEVnFmaTFsM0taNWV1cm9vZXlvSWd3dG9WTDg4b1JSSVltL3kzd3dBZVlFSXFwRmU5MjBEYkJYd0ZRcnRhdWNaM21FYi85Z3NyR2JHMzF3OEN2eHdZUldVWE5DcTAxdzl5TFpqWEQ1STdWbzBPb2sySkYrbG54RU5JMTNaZENxSm95eGNZNys5NVAzWnhWREVnVHN5QXM4NkVEeW9rTVVCdGEwdFZhS1NTdDhJdDYxMkdFOHVuVzZpUTc1Q2cwTW5RNVdtTEJ1aUlKU0hkMXdLWHFDNWdpN3cydms2Vm50d0hIMVMyZ0pFVjNTTUorWWQzcVRpMXo3dHVoZmRQVkRHWlJaaDlYU0dqZmh0bUhPRWZRbkdpYUdlcEhlQmhTaTZRZWJpakhTa0RCYlk2R0lWck5lbW04bXVpblhaVW90aGpLcUFCTU1ERTBxNHpIckRibjhJSGh3U2o4aTBUZm5mK0RVVDJNRmNRajBzS1RvbnZtSCtkaXNMN1duUG9zS2d0MUpZTFVnMDJ6cjcyUnl1SElhT2luMHh2OW50NGZOM2pyZXFKcjhHTDZ2cEtITDVRMzFmVXRWMkl2cXdIVHNGd08wMkZoVjdJQzFWczd4MEtQL0JkVldYSDFkNUdlVi9sQjhFVDBKWHNEc25aV1BqMVhUcENwOG5BMUE5OTJKdUNTVHVSdGtmSDcwc0Zwa1EvNm9SY2t5QjZPMTJ3MzNKczlYZjBscjRZdTY2bTV4STNMSmlobmZzcCtBVE9YdVVhOENSUWlLaDF2czhoVzd5NGFNOW9BSVpyclp4NW9kS2IxVjBtVWc5bjhMNThpRmpqQ2Y1V05ZQVBGMmtqL2tjUmErWVFab24vWHdtd25Xb2R1ZitwSjkzejBuUGtwTHpJR3orNHlLUEpIelRMa29QcS9sWDZGSjU3dFdMbFB0djJWTmM1YjNlZ3lGM3JqMlA2eVVmbnlSNlNqRlh5RXVrdTVSY1d2K3dFbCs2VSt6SnZ2YndibFlxRWRkdllrdGlkNytuQ1ZjeE13aFZoY3J6cjJ4OXQ3bmltbjVwSms4V0E3U2lITGRsYnRpM0did2RGUXJjVkVNZWtBbGNpSE16WE1MUlA1VlliT1YxcTYrM0JtQjl1N2I4ek5FOGNudW11S0FiR1hzQWR0dWpPZnF4U3Bud291cS85RWlrRlZMbVJ5NXJqd1R6Sk9ZZVphcnp3UXQxVE9vMEw0NlB4QThoelV1aDRZZGtuZ1VxQVZ3cjEwVllHdUNTRFM1c21nQVIrdlN6a3FXOTFlbWRzK3RxNVpneC83S01CQnJIQ0ZiK05sQW0zT3hiMW0vR0RCRysvTGhmc3l5czQ2ME0xcnI3OEZxa2J6RXRQNm9rSU5XSkhGdmR0Wk5CNHlLZUNsa3BMbjJaSVZaYjdzK3FiTXh4VUU3SmJ4emd3SDF5UzhyZDRiUE9jOXVxMytmeWRDbysveTJBTkt0WFFoL3V1UkFPTDhmWXRTZW5BTnpSeTl2enk4bm1ETklZT3ZxNHA5bDROQ1pXemx5U0wwWXUyVkc0ZVpvbytEczVJaS82TjFka2dUNUlkMklrMThmdENybm5FUE4yMytpNnBUYXJzclZWZE0vcGRhcVZYeFVLQzdEc01SbVNmcndVRzFaWi9FK003cXUzYkI4MGJHMGgvcW42VlQrOEEyTUYyTVR3MDc3VXZRV0ZQNEt1RS9tODhWRTVOU3VDVkN5dU4zNEE0R2kvdk9VaHY4emdWSHg3cERpb25DNTZ1REhHSG0vRGR5N3B1LzRJQVZZN1ZSWlQ0a3dQRTMvdjBkd1JIN3E0a2tsVjFpRnJsVVBIcVlyK3U3Sk1LMTAyZzdzQlN6TUwxQ3JHNktVL2NPSTNtMmRnZU9weVhPLy8yMjZkK3FGRytFaWdlUEVhYnVYL3RXeG8yUGV1U3RNdGwyQ3NOUGpJUGR3cjMxWUZYd2FWTVQwVlJBMExkOWE5ME8zRWtvdEw0MVNEeUVMSm4yZnRvbHA2ajNNN1J0NzU3bDB0VThmR2hSYTArTnpOaXBGY1Y4OGRZK2xiOUlGdzZJQTRxTmI4bDNyM3hQOGVWREoybTk3cm5zcWVWV24rc3k3bnFjS0RONUtOYTU0TmlndzIzV2RVdTVlL3hpOFo3dVRMMG0zM2Jmb2FveHdsMTVjTytmVitaRkVra0J0L1VTWmdmMHp2anJ0cytGWlF2Qm1heHp0SEZKNlc4Zkx3SVBGUjMvMVpaWjNOT2N1WEU4YzRoZGgwcnc3TENZT1JjdjlUNFlaaWY5T2RmZi96NHovMVArT09Qbi8vKytmUGY5ei9odjMvODVILzk1d2Y3NzE4Ly9ndzBRUkQvQnpLMW94VT0iLCJ6bGliLWNvbXByZXNzZWQiXSwic3ViIjoiMTkxNjM3MCJ9.JCWIycJFK1azvsof3EyFjiu8f2cGt96gC04sprPheYOMRxuDPqIkM9f9obclQn5TEBjrbVw5D5HdzSo_OE_oEWuVnhwaowQKYTw6zVj5ig3krH9-OegCUyqLXDr8fLxAksWedxYCVy7GcWs8To5ZePlOoUFaFD8s290wh23rHYgFuD3_T0-w7AZrfv7_5Iso19RX_yWZrWHXLb-IseeoeEUMN4RJms6e_Wjs2NTECGuaWf4ow1bXtSMAhME-C30PJDQ1SIFqlSAwUPAP1CdbPmFtYc2pjRpsGQ521NoyyqbjYPGuWkgfR9bszLahnYGT4so5eG5l70zcXjDG2Y9rtL_OA4irYRI6CMfA5Na0J_iYXK5VMDmSCm7vz9anrCSHP_9NdoWGjcORjjj80tJeKVMl4yaTe6SktO4s41cHeUozL6RwCGIDywze3M8oNKmDfDVLx5K2slfWa6dFnXJbOFqSy-5rSr8ZtdATN-__5xQstXBCtl2mP3iax2oPvXVHxc_pE1Enjzp-LDUFANnsPPi9E2t-2fPXDWcDWJI2ILQ0SDvO2hi6TG7p9eAzmAcpW6GWCIBht_F8cjM5JDG1qz__jADDWd9DsigNfjaLIqhfaXm6Ah91-0v87f7QIm9xPV-gTaCU9h0hZEQMd-byDxoci1e7HrJlkD91qMxlYqQ";
        return "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzpkZjg0MjM1ZS00NTdiLTQ1YjgtODFiYi0xZDYyYmFmOTJlZWYiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOltdLCJjbGllbnRfaWQiOiJ0cmFucy1sb2dpbiIsImV4cCI6MTc0ODM3MDQ5NywiZXh0Ijp7InVzZXJfaW5mbyI6eyJhY2NvdW50X2lkIjoxOTE2MzcwLCJhZGRvbnNfbWV0YWRhdGEiOnsiZXhjaGFuZ2UiOnsicmVnaW9ucyI6W119LCJyb3V0ZV9jYWxjdWxhdG9yIjp7InJlZ2lvbnMiOltdfX0sImNvbXBhbnkiOnsiaWQiOjEyNTAyMjksImlzX2F1dGhvcml6ZWQiOnRydWUsInJvbGVzIjpbImNhcnJpZXIiXX0sImNvbXBhbnlfaWQiOjEyNTAyMjksImVtYWlsIjoiYW1pc2lhazdAZ21haWwuY29tIiwicGVybWlzc2lvbnMiOnsiaXNfYmxvY2tlZCI6ZmFsc2UsImlzX2RyaXZlciI6ZmFsc2UsImlzX2VudGl0bGVkIjp0cnVlLCJpc19oaWRkZW4iOmZhbHNlLCJpc19tb2RlcmF0b3IiOmZhbHNlfSwidHJhbnNfaWQiOiIxMjUwMjI5LTEifX0sImlhdCI6MTc0ODM0ODg5NiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnBsYXRmb3JtLnRyYW5zLmV1LyIsImp0aSI6IjMyMmVhZGUxLTc1YTktNDE0ZC1iNGRjLTg3ZGFhZWNmZjNjZiIsIm5iZiI6MTc0ODM0ODg5Niwic2NwIjpbIm9mZmxpbmUiLCJvcGVuaWQiLCJlTnFsWEd1UzR5Z1N2c3BlQU1mczlrUnZ6SEV3cEdXbUVHZ0F1YnIyOUJzODlZQkV1UHBIZDhueWx3a2trT1FMTzBPVnZWSERudUlGeElKL3VzMWdMWjNBM2d4UWZsc3RtSCs1RnM3T2x4Q2hIQmlwMmVxMHVRVG5kb2xRVmt4UFYrR1puaGVxQkZoQ0Y3SDdCUE1pOVJjMGVveFJTSmlvSkE5dDV0dE1GWjFnaENoOFM0eXdIOFB0V0RBdndTNDdWZ1pBRmpDenNGWm9OVTVqd0M1YVdYRVhVamdCOXZacGhJTUUvN29nZm1nRFlsSkVVald0elZuSEtPbUxPbW91NWNkaG9jYk5vTndWNjkyazlJSFZnUHR3Njh6SzNHb3VnZHNFRSt1b1crMDFhMngrN1ZNc2ZzekV3RDhyV0ZlV1F2ME5Lc0V2WXNFNW9hWjlxd2FZbm1kUW5EcWhGV0YrcW8yZ2FjN0hlSlJYQTBUVUdBRm1hNmN0ajJZekZTM2FITmRzalN0a1A5Qi9WbUdBNzc3RTJtNlJiKzlxOGVySEEweWN3SWRmL1U5SDRxdXFoUjN5R3ZHQ3AyQVNNRjVLTy9FUUxNeWJ2VDFCTHJWQWpwampwM29jeCsvTGVycmdXbWFxWnVnTTVVRDhmbFYrQlBtQldERXZFcW9SbmVCS08yaHhmVWdBWjIrVXo4SXYySmtrUVExaHVhQ1QwdFlKMW9MYmRackErbkh0SHRzN1NqbktYSGtnVWxnM2dMTkV6SXMycmhhcUF3a3pEZjNpRUpWQVlrZWx6Tnp1NG5FVDZxRmJvbE0ySENYYjB4bnpvTXhwSTlRVU9tUENwOGJzYmpDaFhqcDBwSU5oVWpUMzBvYlFob2NWN1J4bHo3aUZPdndTK3A4VlZ1Q1hYRWQ2UDlveXZFQTE1a1dvRDJxdHZuRzRlM2tSK01XZVZFM1FSKzRhYmF5S0E5SkFlMEZrVU5GQmxUUXlncTd1Q2NyNUhkbnBsb0dIQWZza1RuK0F1dWo5L0lVMjVyKzNXU2YxdWNTUmtZVS8rdHpRYnhmNkZhYXR5eUtEVUlEVTB3UUc3eXN5OFZuakU3WE9kekJrQWdXR09tMXU4WVY5aDhSNU80ZTI5Um5UeXZvZVNEMkpwcGtXdjZhTTZWVzVIb2NFSVF1MTlsTWIzbEtJYkNaMnZWdG14QjNNWnB2WEcrTUlUSThMcGhDanJmTXdkQWF5R00xWHIvVEtRMU5kWVdoaXRJUjNhZkJkMHFUTFppZjVUcVA2VTVIZllsQ0lQVTFEbUlhNms1b21KaXllTS9jQ0xGWk9nRldUMmNZUnU4NHpOV0tZOFViZ0hRdWhlY05RbmUyMnFPcVJaZTBablIvSzRuS1NtdkxqbXpQYk5sMjJrSVpJejdZWjNybXo1VldKMDJvbXFDUUszS2MyL3FEZDI5Q05zekEzSE0rc1pNZGU0cnhsdnd6ZzBwL0dYai9pMHNmV1hqOENlOHFxcUdTbTFVTk1xd2xqdmkzRyt5S2hvNXU1Z21BTlRKdVlMdEYzUXhWN1FnVkgzTWpjNWFPM21pYlNyelBjZ0w5MTdNaUU4SjdmQjdscjN0b3pDVE9CSmt5dTFuazdKclk0Z2l5Tm44R0xGdjVmKzR0TTN0VTdVYUMzOENFOUQ4QnhyKzRrTHJJZkIrcFVNVERKYXdCN08zeDRrNklUeXpqVGJLNWpuMXJxYVhPby9ZZUdlWDcwVGFJVjM5eEtXamxRbkFTcnd0N1NIOVJwZFBUZWRhSDJzUEJmSDdLRlUveEgwbC93VFpMT0pnamNkbkx5dkNzQkZDVzZkMXZIWWtjd1V5SHJaYjdhWjJrVWpTWGVoWlJCaE9XaE90TDA2b0RvdTJjRlpsUGFaRlFmaHorRWNpNzhLcUtTTU4wUHQzQWpYb0h3VTVIenUyOVJFY3JOQUdYK2k4WTMraTFjRS9ydE5Xa2o0SHR0U01GQXNiWjl3R1pESHBSUkR1SDVBcEk0WDU1b2FlcDJqdUI0bUZidzl3UEgxMFFibEdrcGdhV1RjWXhFdEN6N1Q3Z1R2MWQ2MnFSc2poZ1FRZmRLK0Q4NGIyNVZDcVM5cGIrRWcvTWhaUVg0RG9SZlVUZWlobGdyc0hYVUVJVlh4MEk5YnVlamYwSTVHaXFMeHFLTVhsbDZyQWR6TkswcWxaUk5sWWs2K0tSZitjWFJFRzBzc2FScGlHVXg1cEJNUExTQjdWeExyc0MrTDh6TVc3ZzB4NWRmWU1wUUR6MW9vdU5EOHp4RXpzRnE2TUhqTkx1QWJTOU91UmYrT2RyWVcvcGlwaE1RRGhJYzlBeDMvNDV3NmhweFpVNXZmbUpld3NYeGl4Z0RiT0h1cXhVS2JJZzRjK3hVQ0M1UkdQQmlnSXM0NXlUckhRNHpWUnd4czRvbjMzSHBUMGdrTnREbTEvUC9UeFFHcGxYR3hZSk9kVFR1MjZMYUxmamdJbDdGZExkcExhOU9kajBXTTU2TVhwY3JkTTMrUUhkVU1saExUT3NGaXE5U2tjM1VmSUFqUGhVNXhlRE9ZalFEMjVyRkdwdENOUzNMTVlhcXR5RVUrNXErcUpEMG1KMTZSd1RIZlhPeXhUamR3aEVqRzZTbzVvVitlZWJvR1hMY3dYZHFCYnVsd1A5SXB0UFJ0MDdwa3BRYnA3bEViZ2Z1bG5SRXBKZ0NjQ1hHQ3JhVmJzNDZQRDhCSitFWTYyUXVHc3VCQzd0UUYzemlabWNtMEV4ek1EZXBNZTNhakVwUnpyMEsrKzJJR0JMVThpc3Q2T2RSTmR6NXVoSk94K2FKQWV0NDJvQkpIOHVKZ1hBdXdzWU5rSlFnMnVhd2VvSG1semFJdDRmZmlhanVGbWlZcmN2dHVZRGlRazM0TnQybnZCYnRrRFYxMVJubUZXQjd0ZXlWVXhaN1V4OTdrZml1Z3BxOGZjbW9aUDVzZ2lpcnV1Tk9tNTN3RDU4NmxtK1NTOVF2WjU2LzVtVWhZczV1WmpDNzRKY2oyajNCOUNKczBaSU5mN0NVYmpoeHdkenkzMW85bUVYN001UnNVbXE4SXpQRTdFUFRzVzZ4S0VHUXhyY05KaWZyL0RwYTZneW9ScERMUFg2UldkK0ZCQktzbDdqNTcxS3pEK0NFTGd1NjZLUDdRRGszN1VWMWtucVlJYWV6N2RVcUMraUpwU3VNVHFEa0FkU2ZOeTBqSzJ2Z2NJb2NQbFE1cW1XaFd5Z0NPTm1uWmxHdkRJbDNqYTJvZVY2VjE3Nm5jZThqcXpYWllzU3JzWElPVmtqdW0zMVN2eFYzYjlwNThUek1oazNZcmpqcWtmU05uTEd0MVZvQTArT3huTUlNMjZCTFZ1SlVFZUdvZytGQkc0Z0d1TjNQL2NWd3Vud1FXMWRacHBVQzVtNHhBNHhzdmd5aTFnTHVtV1JVcVcrNHdIRkI1V1dMcTNzMk1NZXFQcUkwaDc4dEhnaHM3WXdTUHVUQWhNVXRvbjNFWTIrZEJPTzFaNjdFeU9pc2xXaFVXSnpCTVF4R0hMVWY5dFl0VHVpTzViRDE4YURnQlMxYTM5S2pIbzJyZHl4ZVg1ZEg4SXhVVFJrVXRWeHRweURuVE9DOUwwSXRlUWdsN0xPcHFWdGtKVG95QkwrMk9QYys4aWMxcW1tR05RT1d1WEFWTlR4Q2NZc0pCalg0aUFYNi9qS0ljUkc0S0tWQWRESUF1M3FMbzVvcE1BNTM0Y2loZ2d0QkZoMjZ5M0FqMFBMUTV4aUxMN3dsYWRrVFpucUZMM0dPUGl5SHJ2WUxFSUcrcUV2RGFlSXFiUkVMdnRDTXl3NjVQUkkwczlRaldyUVZXQTRNcDBwVzlSc2s3M1VySEgweHJVTHlXZHdJcG5oclVFMitBalNhNVhFWGhvY3FnT3BEVnFmaTFsM0taNWV1cm9vZXlvSWd3dG9WTDg4b1JSSVltL3kzd3dBZVlFSXFwRmU5MjBEYkJYd0ZRcnRhdWNaM21FYi85Z3NyR2JHMzF3OEN2eHdZUldVWE5DcTAxdzl5TFpqWEQ1STdWbzBPb2sySkYrbG54RU5JMTNaZENxSm95eGNZNys5NVAzWnhWREVnVHN5QXM4NkVEeW9rTVVCdGEwdFZhS1NTdDhJdDYxMkdFOHVuVzZpUTc1Q2cwTW5RNVdtTEJ1aUlKU0hkMXdLWHFDNWdpN3cydms2Vm50d0hIMVMyZ0pFVjNTTUorWWQzcVRpMXo3dHVoZmRQVkRHWlJaaDlYU0dqZmh0bUhPRWZRbkdpYUdlcEhlQmhTaTZRZWJpakhTa0RCYlk2R0lWck5lbW04bXVpblhaVW90aGpLcUFCTU1ERTBxNHpIckRibjhJSGh3U2o4aTBUZm5mK0RVVDJNRmNRajBzS1RvbnZtSCtkaXNMN1duUG9zS2d0MUpZTFVnMDJ6cjcyUnl1SElhT2luMHh2OW50NGZOM2pyZXFKcjhHTDZ2cEtITDVRMzFmVXRWMkl2cXdIVHNGd08wMkZoVjdJQzFWczd4MEtQL0JkVldYSDFkNUdlVi9sQjhFVDBKWHNEc25aV1BqMVhUcENwOG5BMUE5OTJKdUNTVHVSdGtmSDcwc0Zwa1EvNm9SY2t5QjZPMTJ3MzNKczlYZjBscjRZdTY2bTV4STNMSmlobmZzcCtBVE9YdVVhOENSUWlLaDF2czhoVzd5NGFNOW9BSVpyclp4NW9kS2IxVjBtVWc5bjhMNThpRmpqQ2Y1V05ZQVBGMmtqL2tjUmErWVFab24vWHdtd25Xb2R1ZitwSjkzejBuUGtwTHpJR3orNHlLUEpIelRMa29QcS9sWDZGSjU3dFdMbFB0djJWTmM1YjNlZ3lGM3JqMlA2eVVmbnlSNlNqRlh5RXVrdTVSY1d2K3dFbCs2VSt6SnZ2YndibFlxRWRkdllrdGlkNytuQ1ZjeE13aFZoY3J6cjJ4OXQ3bmltbjVwSms4V0E3U2lITGRsYnRpM0did2RGUXJjVkVNZWtBbGNpSE16WE1MUlA1VlliT1YxcTYrM0JtQjl1N2I4ek5FOGNudW11S0FiR1hzQWR0dWpPZnF4U3Bud291cS85RWlrRlZMbVJ5NXJqd1R6Sk9ZZVphcnp3UXQxVE9vMEw0NlB4QThoelV1aDRZZGtuZ1VxQVZ3cjEwVllHdUNTRFM1c21nQVIrdlN6a3FXOTFlbWRzK3RxNVpneC83S01CQnJIQ0ZiK05sQW0zT3hiMW0vR0RCRysvTGhmc3l5czQ2ME0xcnI3OEZxa2J6RXRQNm9rSU5XSkhGdmR0Wk5CNHlLZUNsa3BMbjJaSVZaYjdzK3FiTXh4VUU3SmJ4emd3SDF5UzhyZDRiUE9jOXVxMytmeWRDbysveTJBTkt0WFFoL3V1UkFPTDhmWXRTZW5BTnpSeTl2enk4bm1ETklZT3ZxNHA5bDROQ1pXemx5U0wwWXUyVkc0ZVpvbytEczVJaS82TjFka2dUNUlkMklrMThmdENybm5FUE4yMytpNnBUYXJzclZWZE0vcGRhcVZYeFVLQzdEc01SbVNmcndVRzFaWi9FK003cXUzYkI4MGJHMGgvcW42VlQrOEEyTUYyTVR3MDc3VXZRV0ZQNEt1RS9tODhWRTVOU3VDVkN5dU4zNEE0R2kvdk9VaHY4emdWSHg3cERpb25DNTZ1REhHSG0vRGR5N3B1LzRJQVZZN1ZSWlQ0a3dQRTMvdjBkd1JIN3E0a2tsVjFpRnJsVVBIcVlyK3U3Sk1LMTAyZzdzQlN6TUwxQ3JHNktVL2NPSTNtMmRnZU9weVhPLy8yMjZkK3FGRytFaWdlUEVhYnVYL3RXeG8yUGV1U3RNdGwyQ3NOUGpJUGR3cjMxWUZYd2FWTVQwVlJBMExkOWE5ME8zRWtvdEw0MVNEeUVMSm4yZnRvbHA2ajNNN1J0NzU3bDB0VThmR2hSYTArTnpOaXBGY1Y4OGRZK2xiOUlGdzZJQTRxTmI4bDNyM3hQOGVWREoybTk3cm5zcWVWV24rc3k3bnFjS0RONUtOYTU0TmlndzIzV2RVdTVlL3hpOFo3dVRMMG0zM2Jmb2FveHdsMTVjTytmVitaRkVra0J0L1VTWmdmMHp2anJ0cytGWlF2Qm1heHp0SEZKNlc4Zkx3SVBGUjMvMVpaWjNOT2N1WEU4YzRoZGgwcnc3TENZT1JjdjlUNFlaaWY5T2RmZi96NHovMVArT09Qbi8vKytmUGY5ei9odjMvODVILzk1d2Y3NzE4Ly9ndzBRUkQvQnpLMW94VT0iLCJ6bGliLWNvbXByZXNzZWQiXSwic3ViIjoiMTkxNjM3MCJ9.BQ0RHNtqcXN7IIkr-cN3B1qsHpRLtptgBcbMFB9pTPMBJunxsoHX05kvI91T6RoscsGsP8UCFAZBnOo0zMqERitObXY7kK7yzogAJM7FnnMx9RXDF1Z8JOTwofrS9Up_4B61WqtZffrcx13L_X3mDTxAeNIUJEMmaeFu25N17WpAX9K7ldBupmzaSXw6ZYB5qFK5HUM6He1jd7LCPenV3S6-k5OY6fzP0UMfD7-LsNKEKfwX23s94h6emCr2BHibIomc5V-h27TIWt08ohcP1RHRhhm06QFeEjWxBKzO15nyIsehLJiA_fQodHFVoajTHMusa4IGQsb9aUQGugKhJejm1fH9WyBhZVwCzG2QNo-EihBPOHDbOdQnOwotr3FcICbMo7G7KvkY1o8pgS14Kj6kBoIoPNQr8V7EcD9v4nI2nMcoCPL3W2VqZ1D-7ti00_I5tLZpANhHbdBXei2ZHGR-Ll1eiuoWQypdXd19cNw-L4mlbnt-GmTun6znNAG7r0-YGAHG90971WnHfDAptFcECPWCK4M_7GXqE7vHUTqmDaEnCjkuIrevUKaK65tvyCeyq2g7nakojGk62r7pYptDWO4INFWbR6aXiDqV_VFlfAsLMIYP4Lek5MVMmt8bn8RL8_4iWUNQAnPGMvc4qm7UWhIoq6H_B-OZMufO2VI";
    }

    private getApiBearerToken(): string {
        return "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzpkZjg0MjM1ZS00NTdiLTQ1YjgtODFiYi0xZDYyYmFmOTJlZWYiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOltdLCJjbGllbnRfaWQiOiJkZTkyMDI1Zi05YWZjLTRkNzUtOGU1ZS0yM2I2MzM1Y2U4YjMiLCJleHAiOjE3NDgzNzA2MTEsImV4dCI6eyJ1c2VyX2luZm8iOnsiYWNjb3VudF9pZCI6MTkxNjM3MCwiYWRkb25zX21ldGFkYXRhIjp7ImV4Y2hhbmdlIjp7InJlZ2lvbnMiOltdfSwicm91dGVfY2FsY3VsYXRvciI6eyJyZWdpb25zIjpbXX19LCJjb21wYW55Ijp7ImlkIjoxMjUwMjI5LCJpc19hdXRob3JpemVkIjp0cnVlLCJyb2xlcyI6WyJjYXJyaWVyIl19LCJjb21wYW55X2lkIjoxMjUwMjI5LCJlbWFpbCI6ImFtaXNpYWs3QGdtYWlsLmNvbSIsInBlcm1pc3Npb25zIjp7ImlzX2Jsb2NrZWQiOmZhbHNlLCJpc19kcml2ZXIiOmZhbHNlLCJpc19lbnRpdGxlZCI6dHJ1ZSwiaXNfaGlkZGVuIjpmYWxzZSwiaXNfbW9kZXJhdG9yIjpmYWxzZX0sInRyYW5zX2lkIjoiMTI1MDIyOS0xIn19LCJpYXQiOjE3NDgzNDkwMTAsImlzcyI6Imh0dHBzOi8vYXV0aC5wbGF0Zm9ybS50cmFucy5ldS8iLCJqdGkiOiJiMjgyYTA1Ny1mN2RkLTQ0MGMtYjc4MS1lMGE2NTFiZGY0ZDEiLCJuYmYiOjE3NDgzNDkwMTAsInNjcCI6WyJvZmZsaW5lIiwib3BlbmlkIiwiZU5xbFhPdVc0NmdSZnBXOEFENW5NN3VUNUhFd2xHWFNDTFNBM05ONStoeXV1a0FoM1BOanBtWDVxd0lLS09xR25hSEszcWhoVC9FQ1lzRS8zV2F3bGs1Z2J3WW92NjBXekQ5Y0MyZm5TNGhRRG96VWJIWGFYSUp6dTBRb0s2YW5xL0JNend0VkFpeWhpOWg5Z25tUitnc2FQY1lvSkV4VWtvYzI4MjJtaWs0d1FoUytKVWJZaitGMkxKaVhZSmNkS3dNZ0M1aFpXQ3UwR3FjeFlCZXRyTGdMS1p3QWUvczB3a0dDZjEwUVA3UUJNU2tpcVpyVzVxeGpsUFJGSFRXWDh1T3dVT05tVU82SzlXNVMrc0Jxd0gyNGRXWmxialdYd0cyQ2lYWFVyZmFhTlRhLzlpa1dQMlppNE84VnJDdExvZjRHbGVBWHNlQ2NVTk8rVlFOTXp6TW9UcDNRaWpBLzFVYlFOT2RqUE1xckFTSnFqQUN6dGRPV1I3T1ppaFp0am11MnhoV3lIK2pmcXpEQWQxOWliYmZJdDNlMWVQWGpBU1pPNE1Pdi9xY2o4VlhWd2c1NWpYakJVekFKR0MrbG5YZ0lGdWJOM3A0Z2wxb2dSOHp4VXoyTzQvZGxQVjF3TFROVk0zU0djaUIrdnlvL2d2eEFySmdYQ2RXSVRuQ2xIYlM0UGlTQXN6ZktaK0VYN0V5U29JYXdYTkJKYWVzRWE4SHRPazFnL2JoMmorMGRwUnhscmp3UUthd2J3RmtpNWtVYlZ3dlZnWVNaaG41eGlFb2dzYU5TWm01MzhiZ0o5ZEF0MFNrYmpwTHQ2WXg1VU9hMEVXb0tuVEhoVTJOMk41aFFMeDA2MHNFd0tacDdhVU5vdzhPS2RvNnlaOXhDSFg0Si9mY0tLL0JMcmlPOUgyMFpYcUFhOHlMVUI3VlczempjdmJ3SS9HSlBxaWJvSTNlTk5sYkZBV21ndlNBeXFPaWdTaG9aUVZmM0JPWDhqdXgweThERGdIMFNwejlBWGZSKy9rSWI4OS9ickpQNlhPTEl5TUlmZlc3b3R3djlDdFBXWlpGQktFRHFhUUtEOXhXWitLenhpVnJuT3hneWdRSkRuVGEzK01LK1ErSzhuVVBiK294cFpYMFBwSjVFMDB5TFgxUEc5S3BjajBPQ2tJVmErNmtOYnlsRU5oTzczaTB6NGc1bXM4M3JqWEVFcHNjRlU0alIxbmtZT2dOWmpPYXJWM3Jsb2FtdU1EUXhXc0s3TlBndWFkSmxzNU44cDFIOXFjaHZNU2pFbnFZaFRFUGRTVTBURXhiUG1Yc0JGaXNud0tySmJPT0lYZWVaR2pITWVDUHdqb1hRdkdHb3puWmJWUFhJc3ZhTXpnOWxjVGxKVGZueHpabHRteTViU0VPa1o5c003OXpaOHFyRWFUVVRWQklGN2xNYmY5RHViZWpHV1pnYmptZFdzbU12Y2Q2eVh3Wnc2VTlqcng5eDZXTnJyeCtCUFdWVlZETFQ2aUdtMVlReDN4YmpmWkhRMGMxY1FiQUdwazFNbCtpN29ZbzlvWUlqYm1UdTh0RmJUUlBwMXhsdXdOODZkbVJDZU0vdmc5dzFiKzJaaEpsQUV5Wlg2N3dkRTFzY1FaYkd6K0JGQy8rdi9VVW03K3FkS05CYitKQ2VCK0M0VjNjU0Y5bVBBM1dxR0pqa05ZQzlIVDY4U2RHSlpaeHBOdGV4VHkzMXREblUva1BEUEQvNkp0R0tiMjRsclJ3b1RvSlZZVy9wRCtvME9ucnZ1bEI3V1BpdkQ5bkNLZjRqNlMvNEprbG5Fd1J1T3psNTNwVUFpaExkdTYxanNTT1lxWkQxTWwvdHN6U0t4aEx2UXNvZ3d2SlFIV2w2ZFVEMDNiTUNzeWx0TXFxUHd4OUNPUmQrRlZGSm1PNkhXN2dScjBENHFjajUzYmVvQ09WbWdETC9SZU1iL1JhdUNmMzJtclFSOEwwMnBHQ2dXTnMrWUxNaEQ4b29oL0I4QVVtY0wwKzBOSFU3UjNBOFRDdjQrNEhqYTZJTnlyU1V3TkxKT0VZaVdwYjlKOXlKM3lzOWJWSTJSd3lJb0hzbC9CK2NON2NxQmRMZTBsL0N3Zm1Rc2dKOEI4S3ZxQnRSUTZ3VjJEcHFpTUtyWTZFZXQvUFJQNkVjRFpWRlkxRkdyeXc5MW9NNW1sYVZTc3FteWtRZGZOS3YvT0pvaURhV1dOSTB4TElZYzBnbUh0ckFkcTRsVjZCOWRpRm5WdFhONEIyYVhYQzFGMVBjQytvY0dld3RVekhUQ1FnSENRNTZSclovUnpoMWpSZ3dwemN2eEpkd1h5RnlMbUs4cm9XN3IxWW9zQ0U2ekRFTkh0eVhNT0RGQUJkeGZraldFUnhtcWpoaUVoV3Z1K04rbjVDSUg5L20xL1BWVHhRR3BsVkdveGlkNm1pSXQwVzFXNXpCbmJ1S3YyN1RXbDZkYkhBc3Zqc1p2UzVYNkpyOWdlNm9FTENXbU5ZTEZMK2lJcHVwK1FCSGZOcHdpb0dZeFdnR3RqV0xOVGFGVlZwV1hnd3JiME1vdGpCOVVTSHBNWlAwamdpTysrWmtOM0c2aFE1R05raFJvd3Y5OHN4UmZYL2N3WGRxQmJ1bElQMUlWdExSdDA3VWtrQWJwN2xFYm9mamxpQkVwSmlDWlNVZUNyYVZHczc2Tmo4QkorSEk2V1FaR3N1QkM3dFFGL3pYWm1jbTBFeHpNRGVwTWUzYWpDQlJ6cjBLKyszb0ZSS0E4aXN0Nk9kUk5kejV1aEpPeHo2SndlVjQyb0JKSDh1SmdYQXV3c2FOaFpUTTJlYXdlb0htZ2phSXQxM2ZpWDd1Rm1pWXJjdnR1WURpUWszNE50Mm5weGJ0a0RWMTFSbm1GV0I3dGV5VlV4WjdVeDk3a2ZpdWdwcThMY2lvWlA1c2dpaXJ1dU5PbTUzd0Q1ODZWbXFTUzlRdlo1Ni81bVVoWXM0dVlUQ1I0SmNqMmozQjlLSmgwZW9NZjdEMGF6aHh3ZHp5MzFvOW1FWDdNNVJzVW1xOEl6UEVURUhUQ1c2eEtBR0x4cmNOSmlkTCtqcXk2UXlvUmtES1BYNlJXZCtGQkJLc2w3ajU3MUt6RCtDRUxndTY2S09wVHprMzdVVjFrbnFZSWFlejdkVks0ZmZFMGhWR0o2anhBT3JQbTVhUmxUVndPRVVPSDZwODByTFFMV3dBbk96VHFLZ0hoY1NteGxiVVBLL0thOS9UdVBkUjBKcHNNZUxWV0RrSEt5VDN6VDZwMzRxN04rMGNkaDVtd3lac1Z3ZjFTUHBHenRqV2FpMkE2ZkZZVGlHQmJkQWxnM0NxWG5EVXdmQ2dEVVFEM083bi9tSTRYVDZJcmFzczAwb0JjN2VZclVVMlh3WlJhd0gzVERLcTFDSmM0TGlnOHJMRjFUMGJtR01GSGxHYXczOHRIclJyN1l3UzZ1UEFoTVV0b24xMFltK2RCT08xWjY3RUtPYXNsV2hVUTV6Qk1XUkZITFVmOXRZdEpPaU81YkQxOFFEZUJTMWFpOUtqSG8yQmR5eGVYME5IOE94UlRSa1V0Vnh0cDNqbVRPQzlMMEl0ZVFnbDdMT3BxVnRrcGE1dUNINXRjZTU5NUU5cVZOTU1hd1lYYzVFcGFuaUVRaFFUREdyd0VRdjAvV1VRNHlKd1VjcDI2R1FBZHJVUlJ6VlRZQnp1d3BGRHRSV0NMRHAwbDQxR29PV2h6ekVXU25oTDBySW56UFFLWCtJY2ZWZ09YZTBYSUFKOVVaZUcwOFJWMmlJV1o2SFprUjF5ZXlSb0ZxaEh0R2dyc0h3VlRwV3M2amRJM3V0V09QcGlDb1RrczdnUlRQSFdvSnA4dFdZMHkrTXVEQTlWc05PSHJFNkZxTHYwekM2MVhCVW9sQVZCaExVclhrcFJDaG93TnZsdmh3RTh3SVMwUmEvU3RvRzJDL2hxZ1habGNZM3ZNSTMrN1JkVzNtRnZyeDhFZmprd2lzb3VhRlJvcngva1dqQ3ZIeVIzckJvZFJKc1NMNmpQaUllUXJ1MjZGRVRSbGk4dzN0L3pmdXppcUdKQW5KZ0JaNTBKSDFSSVlvRGExcGFxMEVqVmJZVmIxcnNNSjVaUGpWQWgzeUZCb1pPaHk5TVdEZEFSUzBLNnJ3VXVVVjNBRm5sdGZKMnFNcmtQUHFoc0FTTXJ1a2NTOGcvdlVuRnFuM2ZkQ3UrZnFHTGlpVEQ3dWtKRy9UYk1PTUkvaE9KRTBjNVNPOEREbEZ3ZzgzQkhPMUlHQ214MU1BclhhdEpONWRkRU8rMm9STEhIVkVBRFlJQ0pwVjBUUEdDM1A0VVBEZ2xHNVZzbS9PNzhHNGpzWWE0Z0hwY1VuQkxmTWY4NkZYRDN0ZWJRWVZGYnFDMFhwQnBzbkgzdGoxWU9RMFpGUC9IZDdQZncrTHJIVzlVVFh5OFgxZldWT0h4UnZhOSthN3NRZlZrUG5JTGhKcGtLQzcyUUY2clkzanNVZnVDN0NzaU9xNzJOOHI3S0Q0SW5peXZaSFpLenNVanJ1M1NFVHBPQnFSLzZzRGNGazNZaWJZK08zNWVLUVlsKzFBbTVKa0gwZHJwZ3YrWFk2dS9UTFgweGRsMU56eVZ1V0RCRE8vZFQ4QW1jdmNvMTRFbWdFRkhyZko5RHRuZ2gwSjdSQUF6WFdqbnpRcVUzcTd0TXBCN080SDM1RUxIR0UveXRhZ0FmTHRKRy9JOGkxc3doekJML3Z4SmdPOVU2Y2xkVFQ3cm5wZWZJU1htUk4zNXdrVWVUUDJpV0pRZlYvYXYwS1R6MzZyckszYlB0cWE1SjN1NHJrYnZXSDhmMGs0L09rejBrR2F2a0pkSzl4eThzZnRrSkx0MHA5eVhaZW5rM0toVUo2N2F4SmJFNzM5UGxxSmlaaEN2QzVIalhOelhhM1BGTVB6V1RKb3NCMjFFT1c3SzNiRnVNM3c2S2hHNHJJSTVKeGFoRU9KaXZZV2lmeWcwMGNycUExdHVETVQvYzJuOW5hSjQ0UE5OZFVReU12WUE3Yk5HZC9WaWxUUGxRZEYvN0pWSUtxSElqbC9YQmczbVNjdzR6aGpNN1JiV25kQm9YeGtmakI1RG5wTkR4Y3JGUEFwVUFyeFRxbzYwTWNFa0dselpOQUFuOGVsbklVOS9xOU03WTlMVnp6UmorMkVjRERHSTFLbjV6S0JOdTl5SHFOK01IQ2Q0K1Z0cUh5U3M0NjBQMXFMNVVOcTBwTEgwdTlVU0VHckVqaS9zMk1tZzg1Rk5CUzFXa1R6T2tpc2o5V2ZYTkdRNnFDZG10WXh5WUR5NUorVnM4dG5sT2UvWGJmUDZiaW9TL3kyQU5LdFhRaC91dVJBT0w4Zll0U2VuQU56Unk5dnp5OG5tRE5JWU92cTRwOWw0TkNaV3pseVNMMFl1MlZHNGVab28rRHM1SWkvNk4xZGtnVDVJZDJJazE4ZnRDcm5uRVBOMjMraTZwVGFyc3JWVmRNL3BkYXFWWHhVS0M3RHNNUm1TZnIvQUYxWlovditJN3F1M2JCODBiRzBoL3FuNlZUKzhBMk1GMk1UdzA3N1V2UVdGUDRLdUUvdTh4VkU1TlN1Q1Z5eVdOMzJzNEdpL3ZPVWh2OHpnVkh4N3BEaW9uQzU2dURIR0htL0RkeTdwdS80SUFWWTdWcFpINDh3REUzOUgwOS9sRzdwa2trbFYxaUZybFVQR2FZYit1N0pNSzEwMmc3c0JTek1MMUNyRzZLVS9jT0kzbTJkZ2VPcHlYTy8vMjI2ZCtxRkcrRWlnZVBFYWJ1WC90V3hvMlBldVN0TXRsMkNzTlBqSVA5Ly8yMVlGWHdhVk1UMFZSQTBMZDlhOTBrM0Frb3RMNGhSL3lFTEpuMmZ0b2xwNmozTTdSdDc1N2wwdFU4ZkdoUmEwK056TmlwRmNWODhkWStsYjlJRnc2SUE0cU5iOGwzcjN4UDUyVkRKMm05N3Juc3FlVlduK3N5N25xY0tETjVLTmE1NE5pZ3cyM1dkVXU1ZS94aThaN3VUTDBtMzNiZmpLb3h3bDE1Y08rZlYrWkZFa2tCdC9VU1pnZjB6dmpydHMrRlpRdkJtYXh6dEhGSjZXOGZMd0lQRlIzLzFaWlozTk9jdVhFOFg0Z2RoMHJ3N0xDWU9SY3Y5VDRFWmQvL2ZYUHYvN2dmOXovL1BtRC9meUw4VC9Zdi83OE42Ti8vdmpQei91L2Y4TFBRQk1FOFg5UWJJTVMiLCJ6bGliLWNvbXByZXNzZWQiXSwic3ViIjoiMTkxNjM3MCJ9.JgYR3O-wk0fsPUJYX5EKaEiXVa4NevR27NHn5VZpCnpOTjnIYT4w29GG7PR8TqmGjczf7MaC0AnUPK-mT5uD6WejaRugrdNsqkXa1NPiMcj4DFG1ojW_34LGslqqj_egTB3YNDdLPruuah4ThriqOaos95A8ZTm0W66ABYtRZz1PN9NHuJGpKwcZoifNvyr1rndf06llZDwELHPXRis98_HMADghNaQ7UVhcGmB-jaK28nYPyS2h1vdlihM5nVwRmG20sdn-wx7tEnUetNE0ehKF3CqmAIHXlaOjA4sHf48uuPY2NcT57UtCG02_0KH3BC7-Bm2bDCd3Y_BcuXqaep09CbZZvNyIiA3-uJnpvBFpmYoQbYCRr0DPBuiVlrxFFFW1pa9FcdVN7Uv13yv8wDqq_sqAfjKZ8P1EN88E-W3ILjQSyaXsxxDeANPz7Qfs7k6XPctrrctysXcXvcBma4E4nh18GYsXHhIHO4I6xcXNH_cxrsgpbNAWwSNkRbuYZd2Jiq6bclAcYbTyP6YR2n0TAUhlXURIk8YwfIjT9HiqCre7psYUh3QS_LsBHA1vkfZWaXsooLOxHANZPalnjOzPycUukwJLWflv065tzIybRPEmo6Yrh0hVmLYYKG3HNgiV1AW3ULPM6q2HxIaonjk7F45YNzaZ9Pg_oy7t9SHTbEUs2AmBI0";
    }

    async test(){
        const token = this.getApiBearerToken();


    }

    async fetchOffers(searchParams: any): Promise<any> {
        const baseUrl = 'https://api-platform.trans.eu/app/exchange/api/rest/v2/freight-offers';
        const headers = {
            'Authorization': this.getBearerToken(),
            'Content-Type': 'application/json',
        };
        const mappedParams = {
            filter: {
                loading_place: [
                    {
                         address: {
                             //country: ["47_poland"],
                             locality: searchParams.startLocation.area.address.city,
                             postal_code: searchParams.startLocation.area.address.postalCode
                         },
                        coordinates: {
                            latitude: searchParams.startLocation.area.latitude,
                            longitude: searchParams.startLocation.area.longitude,
                            range: searchParams.startLocation.area.range
                        }
                    }
                ],
                unloading_place: [
                    {
                        address: {
                            //country: ["47_poland"],
                            locality: searchParams.destinationLocation.area.address.city,
                            postal_code: searchParams.destinationLocation.area.address.postalCode
                        },
                        coordinates: {
                            latitude: searchParams.destinationLocation.area.latitude,
                            longitude: searchParams.destinationLocation.area.longitude,
                            range: searchParams.destinationLocation.area.range
                        }
                    }
                ],
                route_distance: {
                    from: this.MIN_DISTANCE,
                    to:     this.MAX_DISTANCE
                },
                price: {
                    from: 1
                },
                //price_currency: "1_eur",
                // required_ways_of_loading: ["1_top", "2_side", "3_back"],
                // available_ways_of_loading: ["1_top", "2_side", "3_back"],
                places_matching_type: "cross",
                exclude_suspended: true
            },
            sort: {
                field: "index",
                order: "desc"
            },
            counters: ["all"]
        };

        try {
            const res = await axios.get(baseUrl, {
                headers,
                params: mappedParams,
                paramsSerializer: params => {
                    return new URLSearchParams({
                        filter: JSON.stringify(params.filter),
                        sort: JSON.stringify(params.sort),
                        counters: JSON.stringify(params.counters)
                    }).toString();
                }
            });

            if (res.status >= 200 && res.status < 300 && res.data) {
                this.logger.log(`Otrzymano ${res.data?._embedded['freight-offers']?.length ?? 0} wyników z Trans.eu.`);
                const offers = res.data?._embedded['freight-offers']?.map((offer: any) => this.convertToTimocomOffer(offer)) || [];

                return { success: true, data:  {
                        payload:offers
                    }};
            } else {
                const msg = `Nieoczekiwany format odpowiedzi Trans.eu: ${res.status}`;
                this.logger.warn(msg);
                return { success: false, data: res.data, error: msg };
            }
        } catch (error) {
            this.logger.error('Błąd zapytania do Trans.eu:', error?.response?.data || error.message);
            //this.logger.warn('parametry:', searchParams);
            return this.handleError(error);
        }
    }

    private convertToTimocomOffer(offer: any): any {
        const freight = offer.freight || {};
        const spots = freight.spots || [];
        const requirements = freight.requirements || {};
        const route = freight.route || {};
        const price = offer.price || {};
        const period = freight.period || {};

        // Funkcja pomocnicza do tłumaczenia kodów krajów
        const getCountryCode = (country: string): string => {
            const map: { [key: string]: string } = {
                '47_poland': 'PL',
                '34_latvia': 'LV'
                // Dodaj inne kody krajów w razie potrzeby
            };
            return country;
        };

        // Funkcja do mapowania miejsc (załadunku/rozładunku)
        const convertSpot = (spot: any, type: string) => {
            const address = spot.place.address;
            const coords = spot.place.coordinates;
            const operation = spot.operations?.[0];
            const beginDate = operation?.local_timespan?.begin?.substring(0, 10);
            const endDate = operation?.local_timespan?.end?.substring(0, 10);

            return {
                loadingType: type.toUpperCase(),
                address: {
                    objectType: "address",
                    city: address?.locality || null,
                    country: getCountryCode(address?.country),
                    geoCoordinate: {
                        longitude: coords?.longitude || null,
                        latitude: coords?.latitude || null,
                    },
                    geocoded: true,
                    postalCode: address?.postal_code || null,
                },
                startTime: null,
                endTime: null,
                earliestLoadingDate: beginDate || null,
                latestLoadingDate: endDate || null,
            };
        };

        const distanceKm = route.distance ? Math.round(route.distance / 1000) : null;
        const amount = price.value || null;

        return {
            objectType: "freightOffer",
            closedFreightExchangeSetting: null,
            contactPerson: null,
            creationDateTime: offer.created_at,
            customer: null,
            deeplink: `https://platform.trans.eu/exchange/offers?e1=offer.details.drawer&e1offerId=%22${offer.id}%22&e1offerType=%22loads%22`,
            excludedCustomers: [],
            id: offer.id,
            internalRemark: null,
            logisticsDocumentTypes: [],
            publicRemark: null,
            trackable: false,
            useMessenger: false,
            vehicleProperties: {
                body: ["CURTAIN_SIDER"], // mapuj dynamicznie jeśli potrzeba
                bodyProperty: [],
                equipment: [],
                loadSecuring: [],
                swapBody: [],
                type: ["TRAILER", "WAGGON_AND_DRAG"], // można dodać logikę na podstawie vehicle_size
            },
            acceptQuotes: false,
            additionalInformation: [],
            distance_km: distanceKm,
            freightDescription: requirements.shipping_remarks || "standard",
            length_m: freight.loading_meters || null,
            loadingPlaces: spots.map(spot => {
                const opType = spot.operations?.[0]?.type || "loading";
                return convertSpot(spot, opType);
            }),
            paymentDueWithinDays: period.days || null,
            price: {
                amount: amount,
                currency: "EUR", // możesz dodać mapowanie: "1_eur" → "EUR"
            },
            weight_t: freight?.requirements?.transport?.total_weight || 10,
            pricePerKm: distanceKm && amount ? +(amount / distanceKm).toFixed(2) : null,
            pricePerKmEur: distanceKm && amount ? +(amount / distanceKm).toFixed(2) : null,
            alreadySaved: false,
            sourceSystem:'transEU'
        };
    }


    private handleError(error: any): any {
        return {
            success: false,
            error: error?.response?.data || error.message || 'Nieznany błąd',
        };
    }


    // 1. Funkcja, która wygeneruje URL do przekierowania użytkownika na autoryzację
    getAuthorizationUrl(state: string): string {
        const clientId = process.env.TRANSEU_CLIENT_ID;
        //const redirectUri = encodeURIComponent(process.env.TRANSEU_REDIRECT_URI || 'https://freightfusion.eu/tokenauthexchange');
        const redirectUri = 'https://freightfusion.eu/tokenauthexchange';
        const link = `https://auth.platform.trans.eu/oauth2/auth?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}`;
        return `<a href="${link}">${link}</a>`;
    }

    // 2. Funkcja do wymiany code na access token
    async exchangeCodeForToken(code: string): Promise<void> {
        const clientId = process.env.TRANSEU_CLIENT_ID;
        const clientSecret = process.env.TRANSEU_CLIENT_SECRET;
        const redirectUri = process.env.TRANSEU_REDIRECT_URI || 'https://freightfusion.eu/tokenauthexchange';

        if (!clientId || !clientSecret) {
            throw new Error('Brak TRANSEU_CLIENT_ID lub TRANSEU_CLIENT_SECRET w zmiennych środowiskowych');
        }

        try {
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            });

            const response = await axios.post(
                'https://api.platform.trans.eu/ext/auth-api/accounts/token',
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Api-key': process.env.TRANSEU_API_KEY || '',
                    },
                },
            );

            this.accessToken = response.data.access_token;
            this.logger.log('Pomyślnie uzyskano token dostępu z Trans.eu');
        } catch (error) {
            this.logger.error('Błąd wymiany kodu na token:', error?.response?.data || error.message);
            throw new Error('Nie udało się uzyskać tokenu dostępu');
        }
    }


    // Przykład metody korzystającej z accessToken
    async fetchFreights(searchParams: any = {}): Promise<any> {
        const state = '54645634235122';
        return this.getAuthorizationUrl(state);
        if (!this.accessToken) {
            throw new Error('Brak tokenu dostępu. Wykonaj najpierw wymianę kodu na token.');
        }

        try {
            const response = await axios.post(
                'https://api.platform.trans.eu/ext/freights-api/v1/freights/search',
                searchParams,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Api-key': process.env.TRANSEU_API_KEY,
                    },
                },
            );

            this.logger.log(`Pobrano ${response.data?.length || 0} frachtów z giełdy Trans.eu`);
            return { success: true, data: response.data };
        } catch (error) {
            this.logger.error('Błąd pobierania frachtów:', error?.response?.data || error.message);
            return {
                success: false,
                status: error.response?.status || 500,
                error: error.response?.data?.title || error.message,
            };
        }
    }
}
