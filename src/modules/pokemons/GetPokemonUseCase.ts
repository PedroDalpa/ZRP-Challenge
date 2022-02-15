import axios from "axios";
import { Request, Response } from "express";
import { redisClient } from "../../../redisConfig";
import { api } from "../../services/api";

interface IPokemonInfo {
  data: {
    abilities: [{
      ability: {
        name: string,
        url: string
      }
    }]
  }
}

export async function getPokemon(request: Request, response: Response): Promise<Response> {
  try {
    const { name } = request.params;

    const hasPokemonCache = await redisClient.get(name);

    if (hasPokemonCache) {
      return response.status(200).json({ pokemon: JSON.parse(hasPokemonCache) });
    }

    const { data }: IPokemonInfo = await api.get(`/pokemon/${name}`);

    const abilitiesDescriptionUrl = data.abilities.map(async item => {
      return axios.get(item.ability.url);
    });

    const result = await Promise.all(abilitiesDescriptionUrl);

    result.forEach(async (item, index) => {
      Object.assign(
        data.abilities[index].ability,
        {
          description: item?.data ? item.data.effect_entries[1].effect : item
        }
      )
    });

    const orderAbilities = data.abilities.sort((first, second) => {

      if (first.ability.name < second.ability.name) {
        return -1;
      }
      if (first.ability.name > second.ability.name) {
        return 1;
      }

      return 0;
    });

    redisClient.set(name, JSON.stringify(orderAbilities));

    return response.status(200).json({ pokemon: orderAbilities });
  } catch (error) {
    return response.status(500);
  }
}