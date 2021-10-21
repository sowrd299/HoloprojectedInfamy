pseudonums = {
	"false" : "False",
	"true" : "True"
}

def eval_restriction(option, context = dict(), lists = ["tools"]):
	
	r = option.restriction

	# Handle having no restrictions
	if not r:
		return True

	# Handle the context
	context = { k:v for k,v in context.items() }
	for name in filter( lambda x : x in context, lists):
		context[name] = context[name].split(",")
	text = r.format(**context)

	# Handle pseudonyms
	for k,v in pseudonums.items():
		text = text.replace(k,v)

	return eval(text)