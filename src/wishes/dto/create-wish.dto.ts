export class CreateWishDto {
  name: string;
  link: string;
  image: string;
  price: number;
  description?: string;
  owner?: any; // временно; позже заменим на id/сущность и валидаторы
}
