import { Router } from "express";
import { getPokemon } from "./modules/pokemons/GetPokemonUseCase";

const router = Router();

router.get('/pokemon/:name', getPokemon);

export { router };