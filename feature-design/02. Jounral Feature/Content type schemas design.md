
Lesson will have 2 types, `Learning` and `Preparing`


### content item schema

The content will contain one of these object types

#### emotion_log 
```json
{
	"type": "emotion_log",
}
```


#### sleep_check
```json
{
	"type": "sleep_check",
}
```

#### journal_prompt

```json
{
	"type": "journal_prompt",
	"question_content": string,
	"question_description": string
}
```

#### doc
```json
{
	"type": "doc",
	"header": "",
	"body": "" as htmlString,
}
```


#### cta 

```json
{
	"type": "cta",
	"cta_component": "" as VueComponentName
	"component_prop": {
		
	}
}
```

#### furhter_reading
```json
{
	"type": "further_reading",
	"contents": [
		{
			"type": "article" | "video" | "paper",
			"title": "",
			"link": ""
		}
	]
}
```

