import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const Filter = z.object({
  expertType: z.string().nullable(),
  location: z.string().nullable(),
  experience: z.number().nullable(),
  rating: z.number().min(0).max(5).nullable(),
});

async function callOpenAI(query: string): Promise<any> {
    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        { role: "system", content: "Extract the information about what type of expert user is talking about and his credentials. If user typed state of a country instead of country, look up the country and return the country code in place of location. Return any string in uppercase." },
        {
          role: "user",
          content: query,
        },
      ],
      text: {
        format: zodTextFormat(Filter, "event"),
      },
    });
    console.log(response.output_parsed);
    return response.output_parsed;
}

export default callOpenAI;



