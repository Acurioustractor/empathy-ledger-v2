# 🦙 Ollama Setup Guide - FREE Unlimited AI

You mentioned Ollama is already running in Docker! Here's how to use it with this app.

## ✅ What You Have
- Ollama running in Docker
- Docker container accessible at `http://localhost:11434`

## 🚀 Quick Setup (2 minutes)

### 1. Pull the recommended model

```bash
# Find your Ollama container
docker ps | grep ollama

# Pull Llama 3.1 8B (best balance of speed/quality)
docker exec -it <container-name> ollama pull llama3.1:8b

# Alternative: Smaller, faster model (4B)
docker exec -it <container-name> ollama pull llama3.1:4b

# Alternative: Larger, higher quality (70B - slower but amazing)
docker exec -it <container-name> ollama pull llama3.1:70b
```

### 2. Configure your app

Add this to your `.env.local`:

```bash
# Use Ollama (FREE, unlimited)
LLM_PROVIDER=ollama
```

That's it! 🎉

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| llama3.1:4b | 2.3GB | ⚡⚡⚡ Fast | Good | Bulk processing, simple tasks |
| llama3.1:8b | 4.7GB | ⚡⚡ Fast | Great | **Recommended - Best balance** |
| llama3.1:70b | 40GB | ⚡ Slower | Excellent | Critical analysis, complex tasks |

## 🔄 How It Works

The app will automatically use Ollama for ALL AI operations:

1. **Quote extraction** - Finding meaningful quotes in transcripts
2. **Theme analysis** - Identifying patterns across stories
3. **Project outcomes tracking** - Analyzing progress against goals
4. **Context-aware analysis** - Understanding project-specific success metrics

## 💰 Cost Comparison

### Before (OpenAI gpt-4o-mini):
- Rate limit: 200K tokens per minute
- Cost: $0.150 per M input tokens, $0.600 per M output tokens
- Analyzing Goods project (3 transcripts): **~$0.50**

### After (Ollama):
- Rate limit: **UNLIMITED** ♾️
- Cost: **$0.00** (runs on your machine)
- Analyzing Goods project (3 transcripts): **FREE**

## 🧪 Test It

Check if Ollama is accessible:

```bash
curl http://localhost:11434/api/tags
```

Should return a list of models you've pulled.

Test generation:

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Why is water wet?",
  "stream": false
}'
```

## 🔧 Advanced Configuration

### Check which models you have:

```bash
docker exec -it <container-name> ollama list
```

### Remove unused models to save space:

```bash
docker exec -it <container-name> ollama rm <model-name>
```

### Monitor Ollama logs:

```bash
docker logs -f <container-name>
```

## 🆘 Troubleshooting

### "Connection refused" errors

Check if Ollama container is running:
```bash
docker ps | grep ollama
```

If not running, start it:
```bash
docker start <container-name>
# OR restart it
docker restart <container-name>
```

### Slow generation

- Use smaller model: `llama3.1:4b` instead of `8b`
- Check CPU/RAM usage: `docker stats`
- Ensure Docker has enough resources allocated (8GB+ recommended)

### Quality not good enough

- Upgrade to larger model: `llama3.1:70b`
- Or fall back to OpenAI by setting `LLM_PROVIDER=openai` in `.env.local`

## 🎯 Next Steps

1. **Set `LLM_PROVIDER=ollama`** in `.env.local`
2. **Clear analysis cache** (click button in UI)
3. **Regenerate Goods analysis** - should now use Ollama
4. **Check terminal logs** - should see "🦙 Using Ollama" messages

## 🌟 Benefits

✅ **No rate limits** - Process unlimited transcripts
✅ **No API costs** - $0.00 forever
✅ **Privacy** - Data never leaves your machine
✅ **Speed** - No network latency
✅ **Reliability** - No external service dependencies

The app will automatically fall back to OpenAI if Ollama is unavailable, so you're covered both ways.
